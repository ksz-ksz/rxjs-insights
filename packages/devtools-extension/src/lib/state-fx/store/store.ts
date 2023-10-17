import { Action, ActionType } from '@lib/state-fx/store';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { Actions, actionsComponent } from './actions';
import { produce } from 'immer';
import { Component, Container, InitializedComponent } from './container';
import { StoreView } from './store-view';
import { Deps, DepsState, getDepsState } from './deps';
import { infer } from 'zod';

export interface Store<TNamespace extends string, TState>
  extends StoreView<{ [K in TNamespace]: TState }> {
  readonly namespace: TNamespace;
}

export interface StoreComponent<TNamespace extends string, TState>
  extends Component<Store<TNamespace, TState>> {
  readonly namespace: TNamespace;
  readonly deps: Deps;
}

export interface CreateStoreOptions<
  TNamespace extends string,
  TState,
  TDeps extends Deps
> {
  namespace: TNamespace;
  state: TState;
  deps?: [...TDeps];
}

type ExtractActionTypePayload<TActionType> = TActionType extends ActionType<
  infer TPayload
>
  ? TPayload
  : never;

export type StateTransitionAction<TActionTypes extends ActionType<any>[]> =
  Action<ExtractActionTypePayload<TActionTypes[number]>>;

export interface StateTransition<
  TState,
  TDeps extends Deps,
  TActions extends ActionType<any>[]
> {
  actions: TActions;
  handler: (
    state: TState,
    action: StateTransitionAction<TActions>,
    deps: DepsState<TDeps>
  ) => TState | void;
}

export type StateTransitions<TState, TDeps extends Deps> =
  | Record<string, StateTransition<TState, TDeps, ActionType<any>[]>>
  | Array<StateTransition<TState, TDeps, ActionType<any>[]>>;

export function tx<
  TState,
  TDeps extends Deps,
  TActions extends ActionType<any>[]
>(
  actions: TActions,
  handler: (
    state: TState,
    action: StateTransitionAction<TActions>,
    deps: DepsState<TDeps>
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
) => StoreComponent<TNamespace, TState> {
  const { namespace, state, deps = [] } = options;
  return (transitions) =>
    createStoreComponent(namespace, state, deps, transitions);
}

interface TransitionMapEntry<TState> {
  key: string;
  handler: (state: TState, action: Action<any>, deps: any) => TState | void;
}

function getTransitionsByActions<TState>(
  transitions: [string, StateTransition<TState, Deps, ActionType<any>[]>][]
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
  transitions: [string, StateTransition<TState, Deps, ActionType<any>[]>][],
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

function createStoreInstance<TNamespace extends string, TState>(
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
          return nextDraft;
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

function createStoreComponent<TNamespace extends string, TState>(
  namespace: TNamespace,
  state: TState,
  deps: Deps,
  transitions: StateTransitions<TState, Deps>
): StoreComponent<TNamespace, TState> {
  return {
    namespace,
    deps,
    init(
      container: Container
    ): InitializedComponent<Store<TNamespace, TState>> {
      const actionsHandle = container.use(actionsComponent);
      const depsHandles = deps.map((dep) => container.use(dep));

      const actions = actionsHandle.component;
      const depStoreViews = depsHandles.map((depHandle) => depHandle.component);

      const store = createStoreInstance(
        namespace,
        state,
        actions,
        depStoreViews,
        transitions
      );

      return {
        component: store,
        dispose() {
          store.dispose();
          actionsHandle.release();
          for (const depsHandle of depsHandles) {
            depsHandle.release();
          }
        },
      };
    },
  };
}

export type StoreState<TStore extends StoreComponent<any, any>> =
  TStore extends StoreComponent<infer TNamespace, infer TState>
    ? { [K in TNamespace]: TState }
    : never;
