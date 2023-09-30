import { Action, ActionFactory } from '@lib/state-fx/store';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { Actions, actionsComponent } from './actions';
import { produce } from 'immer';
import { Component, Container, InitializedComponent } from './container';
import { StoreView } from './store-view';
import { Deps, DepsType, getDepsState } from './deps';

export interface Store<TNamespace extends string, TState>
  extends StoreView<{ [K in TNamespace]: TState }> {
  readonly namespace: TNamespace;
}

export interface CreateStoreOptions<
  TNamespace extends string,
  TState,
  TDeps extends Deps
> {
  namespace: TNamespace;
  state: TState;
  deps?: TDeps;
}

type ExtractActionFactoryPayloadType<TActionFactory> =
  TActionFactory extends ActionFactory<infer TPayload> ? TPayload : never;

export type ActionType<TActionFactories extends ActionFactory<any>[]> = Action<
  ExtractActionFactoryPayloadType<TActionFactories[number]>
>;

export interface StateTransition<
  TState,
  TDeps extends Deps,
  TActions extends ActionFactory<any>[]
> {
  actions: TActions;
  handler: (
    state: TState,
    action: ActionType<TActions>,
    deps: DepsType<TDeps>
  ) => TState | void;
}

export type StateTransitions<TState, TDeps extends Deps> =
  | Record<string, StateTransition<TState, TDeps, ActionFactory<any>[]>>
  | Array<StateTransition<TState, TDeps, ActionFactory<any>[]>>;

export function tx<
  TState,
  TDeps extends Deps,
  TActions extends ActionFactory<any>[]
>(
  actions: TActions,
  handler: (
    state: TState,
    action: ActionType<TActions>,
    deps: DepsType<TDeps>
  ) => TState | void
): StateTransition<TState, TDeps, TActions> {
  return {
    actions,
    handler,
  };
}

export function createStore<
  TNamespace extends string,
  TState,
  TDeps extends Deps = []
>(
  options: CreateStoreOptions<TNamespace, TState, TDeps>
): (
  transitions: StateTransitions<TState, TDeps>
) => Component<Store<TNamespace, TState>> {
  const { namespace, state, deps = [] } = options;
  return (transitions) =>
    new StoreComponent(namespace, state, deps, transitions);
}

interface TransitionMapEntry<TState> {
  key: string;
  handler: (state: TState, action: Action<any>, deps: any) => TState | void;
}

function getTransitionsByActions<TState>(
  transitions: [string, StateTransition<TState, Deps, ActionFactory<any>[]>][]
) {
  const transitionsMap = new Map<string, TransitionMapEntry<TState>[]>();

  for (let [key, { actions, handler }] of transitions) {
    for (let action of actions) {
      const actionKey = `${action.namespace}::${action.name}`;
      const entry = transitionsMap.get(actionKey);
      if (entry !== undefined) {
        entry.push({
          key,
          handler,
        });
      } else {
        transitionsMap.set(actionKey, [
          {
            key,
            handler,
          },
        ]);
      }
    }
  }

  return transitionsMap;
}

function getActionSources<TState>(
  transitions: [string, StateTransition<TState, Deps, ActionFactory<any>[]>][],
  actions: Actions
) {
  return Array.from(
    new Set(transitions.flatMap(([, { actions }]) => actions))
  ).map((action) => actions.ofType(action));
}

export class StoreError extends Error {
  constructor(
    readonly namespace: string,
    readonly key: string,
    readonly cause: any
  ) {
    super(`Error in ${namespace}::${key}`);
  }
}

function createStoreComponent<TNamespace extends string, TState>(
  namespace: TNamespace,
  state: TState,
  actions: Actions,
  deps: StoreView<any>[],
  transitions: StateTransitions<TState, Deps>
) {
  const transitionsEntries = Object.entries(transitions);
  const transitionsByActions = getTransitionsByActions(transitionsEntries);
  const actionSources = getActionSources(transitionsEntries, actions);

  const stateSubject = new BehaviorSubject({
    [namespace]: state,
  });

  const subscription = merge(...actionSources).subscribe({
    next(action) {
      const actionKey = `${action.namespace}::${action.name}`;
      const transitions = transitionsByActions.get(actionKey);
      if (transitions !== undefined) {
        const depsState = getDepsState(deps);
        const prevState = stateSubject.getValue()[namespace];
        const nextState = produce(prevState, (draft: TState) => {
          let nextDraft = draft;
          for (const { key, handler } of transitions) {
            try {
              nextDraft = handler(nextDraft, action, depsState) ?? nextDraft;
            } catch (e) {
              throw new StoreError(namespace, key, e);
            }
          }
        });
        stateSubject.next({ [namespace]: nextState });
      }
    },
    // TODO: error, complete?
  });

  const store: Store<TNamespace, TState> = {
    namespace,
    actionSources,
    getState() {
      return stateSubject.getValue() as { [K in TNamespace]: TState };
    },
    getStateObservable() {
      return stateSubject.asObservable() as Observable<{
        [K in TNamespace]: TState;
      }>;
    },
    dispose() {
      subscription.unsubscribe();
    },
  };

  return store;
}

class StoreComponent<TNamespace extends string, TState>
  implements Component<Store<TNamespace, TState>>
{
  constructor(
    private readonly namespace: TNamespace,
    private readonly state: TState,
    private readonly deps: Deps,
    private readonly transitions: StateTransitions<TState, Deps>
  ) {}

  init(container: Container): InitializedComponent<Store<TNamespace, TState>> {
    const actionsHandle = container.use(actionsComponent);
    const depsHandles = this.deps.map((dep) => container.use(dep));

    const actions = actionsHandle.component;
    const deps = depsHandles.map((depHandle) => depHandle.component);

    const store = createStoreComponent(
      this.namespace,
      this.state,
      actions,
      deps,
      this.transitions
    );

    return {
      component: store,
      dispose() {
        store.dispose();
        actionsHandle.release();
        for (let depsHandle of depsHandles) {
          depsHandle.release();
        }
      },
    };
  }
}
