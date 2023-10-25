import { Action, ActionSource, ActionType } from '@lib/state-fx/store';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { Actions, actionsComponent } from './actions';
import { produce } from 'immer';
import { Component, Container, InitializedComponent } from './container';
import { Deps, DepsState, getDepsState } from './deps';

export interface Store<TState> {
  readonly actionSources: ActionSource<any>[];

  getState(): TState;

  getStateObservable(): Observable<TState>;

  dispose(): void;
}

export interface StoreComponent<TState> extends Component<Store<TState>> {}

export interface CreateStoreOptions<TState, TDeps extends Deps> {
  namespace: string;
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
  options: CreateStoreOptions<TState, TDeps>
): (transitions: StateTransitions<TState, TDeps>) => StoreComponent<TState> {
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
  deps: Store<any>[],
  transitions: StateTransitions<TState, Deps>
) {
  const transitionsEntries = Object.entries(transitions);
  const transitionsByActions = getTransitionsByActions(transitionsEntries);
  const actionSources = getActionSources(transitionsEntries, actions);

  const stateSubject = new BehaviorSubject(state);

  const subscription = merge(...actionSources).subscribe({
    next(action) {
      const actionKey = `${action.namespace}::${action.name}`;
      const transitions = transitionsByActions.get(actionKey);
      if (transitions !== undefined) {
        const depsState = getDepsState(deps);
        const prevState = stateSubject.getValue();
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
        stateSubject.next(nextState);
      }
    },
    // TODO: error, complete?
  });

  const store: Store<TState> = {
    actionSources,
    getState() {
      return stateSubject.getValue();
    },
    getStateObservable() {
      return stateSubject.asObservable();
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
): StoreComponent<TState> {
  return {
    init(container: Container): InitializedComponent<Store<TState>> {
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
