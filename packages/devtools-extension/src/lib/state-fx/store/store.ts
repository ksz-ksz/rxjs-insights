import { BehaviorSubject, merge, Observable } from 'rxjs';
import { Actions, actionsComponent } from './actions';
import { produce } from 'immer';
import { Component, Container, ComponentInstance } from './container';
import { ActionSource } from './action-source';
import { Deps, useDeps } from './deps';
import { Action, ActionType } from './action';
import { StoreError } from './store-error';

export interface Store<TState> {
  readonly actionSources: ActionSource<any>[];

  getState(): TState;

  getStateObservable(): Observable<TState>;

  dispose(): void;
}

export interface StoreComponent<TState> extends Component<Store<TState>> {}

export interface CreateStoreOptions<TState, TDeps> {
  namespace: string;
  state: TState;
  deps?: Deps<TDeps>;
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
  TActions extends ActionType<any>[],
  TDeps
> {
  actions: TActions;
  handler: (
    state: TState,
    action: StateTransitionAction<TActions>,
    deps: TDeps
  ) => TState | void;
}

export type StateTransitions<TState, TDeps> =
  | Record<string, StateTransition<TState, ActionType<any>[], TDeps>>
  | Array<StateTransition<TState, ActionType<any>[], TDeps>>;

export function tx<TState, TActions extends ActionType<any>[], TDeps>(
  actions: TActions,
  handler: (
    state: TState,
    action: StateTransitionAction<TActions>,
    deps: TDeps
  ) => TState | void
): StateTransition<TState, TActions, TDeps> {
  return {
    actions,
    handler,
  };
}

export function createStore<TState, TDeps>(
  options: CreateStoreOptions<TState, TDeps>
): (transitions: StateTransitions<TState, TDeps>) => StoreComponent<TState> {
  const { namespace, state, deps = {} as Deps<TDeps> } = options;
  return (transitions) =>
    createStoreComponent(namespace, state, deps, transitions);
}

interface TransitionMapEntry<TState> {
  key: string;
  handler: (state: TState, action: Action<any>, deps: any) => TState | void;
}

function getTransitionsByActions<TState>(
  transitions: [string, StateTransition<TState, any, any>][]
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

function getActionSources(
  transitions: [string, StateTransition<any, any, any>][],
  actions: Actions
) {
  return Array.from(
    new Set(transitions.flatMap(([, { actions }]) => actions))
  ).map((action) => actions.ofType(action));
}

function createStoreInstance<TState, TDeps>(
  namespace: string,
  state: TState,
  actions: Actions,
  deps: TDeps,
  transitions: StateTransitions<TState, TDeps>
) {
  const transitionsEntries = Object.entries(transitions);
  const transitionsByActions = getTransitionsByActions(transitionsEntries);
  const actionSources = getActionSources(transitionsEntries, actions);

  const stateSubject = new BehaviorSubject(state);

  const subscription = merge(...actionSources).subscribe({
    next(action) {
      try {
        const actionKey = `${action.namespace}::${action.name}`;
        const transitions = transitionsByActions.get(actionKey);
        if (transitions !== undefined) {
          const prevState = stateSubject.getValue();
          const nextState = produce(prevState, (draft: TState) => {
            let nextDraft = draft;
            for (const { key, handler } of transitions) {
              try {
                nextDraft = handler(nextDraft, action, deps) ?? nextDraft;
              } catch (e) {
                throw new StoreError(namespace, key, e);
              }
            }
            return nextDraft;
          });
          stateSubject.next(nextState);
        }
      } catch (error) {
        throw new StoreError(namespace, '*', error);
      }
    },
    error(error: any) {
      queueMicrotask(() => {
        throw new StoreError(namespace, '*', error);
      });
    },
    // TODO: complete?
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

function createStoreComponent<TState, TDeps>(
  namespace: string,
  state: TState,
  depsComponents: Deps<TDeps>,
  transitions: StateTransitions<TState, TDeps>
): StoreComponent<TState> {
  return {
    init(container: Container): ComponentInstance<Store<TState>> {
      const actionsHandle = container.use(actionsComponent);
      const { deps, depsHandles } = useDeps(container, depsComponents);

      const actions = actionsHandle.component;

      const store = createStoreInstance(
        namespace,
        state,
        actions,
        deps,
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
