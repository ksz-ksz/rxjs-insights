import { Action, ActionType } from './action';
import { Actions, actionsComponent } from './actions';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { produce } from 'immer';
import { StoreError } from './store-error';
import {
  Component,
  Components,
  createComponent,
  createComponents,
} from './container';

export type ExtractPayloadFromActionType<TActionType> =
  TActionType extends ActionType<infer TPayload> ? TPayload : never;

export type ExtractPayloadFromActionTypesArray<
  TActionTypes extends ActionType[]
> = ExtractPayloadFromActionType<TActionTypes[number]>;

export interface TransitionDef<
  TState,
  TActionTypes extends ActionType<any>[] = ActionType<any>[]
> {
  actions: TActionTypes;
  handler: (
    state: TState,
    action: Action<ExtractPayloadFromActionTypesArray<TActionTypes>>
  ) => TState | void;
}

export interface StoreDef<TState> {
  name?: string;
  state: TState;
  transitions: TransitionDef<TState>[] | Record<string, TransitionDef<TState>>;
}

export interface Store<TState> {
  getState(): TState;

  getStateObservable(): Observable<TState>;

  dispose(): void;
}

export interface StoreComponent<TState> extends Component<Store<TState>> {}

interface TransitionMapEntry<TState> {
  key: string;
  handler: (state: TState, action: Action<any>) => TState | void;
}

function getTransitionsByActions<TState>(
  transitions: [string, TransitionDef<TState>][]
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
  transitions: [string, TransitionDef<TState>][],
  actions: Actions
) {
  return Array.from(
    new Set(transitions.flatMap(([, { actions }]) => actions))
  ).map((action) => actions.ofType(action));
}

export function createStore<TState>(
  actions: Actions,
  def: StoreDef<TState>
): Store<TState> {
  const { name, state, transitions } = def;
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
                nextDraft = handler(nextDraft, action) ?? nextDraft;
              } catch (e) {
                throw new StoreError(name, key, e);
              }
            }
            return nextDraft;
          });
          stateSubject.next(nextState);
        }
      } catch (error) {
        throw new StoreError(name, '*', error);
      }
    },
    error(error: any) {
      queueMicrotask(() => {
        throw new StoreError(name, '*', error);
      });
    },
    // TODO: complete?
  });

  return {
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
}

export function createStoreComponent<TState, TDeps>(
  createStoreDef: (deps: TDeps) => StoreDef<TState>,
  deps: Components<TDeps> = {} as Components<TDeps>
): StoreComponent<TState> {
  return createComponent(
    ({ actions, deps }) => createStore(actions, createStoreDef(deps)),
    {
      deps: { actions: actionsComponent, deps: createComponents(deps) },
      dispose(store) {
        store.dispose();
      },
    }
  );
}

export function tx<TState, TActionTypes extends ActionType<any>[]>(
  actions: [...TActionTypes],
  handler: (
    state: TState,
    action: Action<ExtractPayloadFromActionTypesArray<TActionTypes>>
  ) => TState | void
): TransitionDef<TState, TActionTypes> {
  return { actions, handler };
}
