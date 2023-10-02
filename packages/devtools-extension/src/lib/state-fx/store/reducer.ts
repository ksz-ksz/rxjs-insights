import { Action, ActionType, createActions } from './action';
import { ExtractPayload } from './is';
import { identity } from 'rxjs';
import { createStateSelector, Selector } from './selector';

export interface ReducerFunction<TState, TStoreState, TPayload = any> {
  (state: TState, payload: TPayload, storeState: TStoreState): TState | void;
}

export interface ReducerFunctions<TState, TStoreState> {
  [name: string]: ReducerFunction<TState, TStoreState>;
}

export interface Reducer<TNamespace extends string, TState, TStoreState> {
  namespace: TNamespace;
  initialState: TState;
  reduce(state: TState, action: Action<any>, storeState: TStoreState): TState;
}

export type ReducerPayload<TReducer> = TReducer extends ReducerFunction<
  any,
  any,
  infer TPayload
>
  ? TPayload
  : never;

export type ReducerPayloads<TReducers> = {
  [TReducerName in keyof TReducers]: ReducerPayload<TReducers[TReducerName]>;
};

export type ReducerActions<TReducers> = {
  [TReducerName in keyof TReducers]: ActionType<
    ReducerPayload<TReducers[TReducerName]>
  >;
};

export interface CreateReducersOptions<
  TNamespace,
  TState,
  TStoreState,
  TReducers extends ReducerFunctions<TState, TStoreState>
> {
  namespace: TNamespace;
  initialState: TState;
  storeState?: TStoreState;
  reducers: TReducers;
}

export class ReducerError extends Error {
  constructor(
    readonly namespace: string,
    readonly name: string,
    readonly cause: any
  ) {
    super(`Error in reducer "${namespace}::${name}"`, { cause });
  }
}

export function createReducer<
  TNamespace extends string,
  TState,
  TStoreState,
  TReducers extends ReducerFunctions<TState, TStoreState>
>({
  namespace,
  initialState,
  reducers,
}: CreateReducersOptions<TNamespace, TState, TStoreState, TReducers>): [
  Reducer<TNamespace, TState, TStoreState>,
  Selector<Record<TNamespace, TState>, [], TState>,
  ReducerActions<TReducers>
] {
  const reducer: Reducer<TNamespace, TState, TStoreState> = {
    namespace,
    initialState,
    reduce(
      state: TState,
      action: Action<any>,
      storeState: TStoreState
    ): TState {
      let nextState: TState = state;
      if (action.namespace === namespace) {
        const actionReducer = reducers[action.name];
        if (actionReducer !== undefined) {
          try {
            nextState =
              actionReducer(nextState, action.payload, storeState) ?? nextState;
          } catch (e) {
            throw new ReducerError(namespace, action.name, e);
          }
        }
      }
      return nextState;
    },
  };

  const selector = createStateSelector<Record<TNamespace, TState>, [], TState>(
    (state) => state[namespace]
  );

  const actions = createActions<ReducerPayloads<TReducers>>({
    namespace,
  });

  return [reducer, selector, actions];
}

export interface ActionReducer<
  TState,
  TStoreState,
  TActions extends ActionType<any>[]
> {
  action: [...TActions];
  reduce: (
    state: TState,
    action: Action<ExtractPayload<TActions[number]>>,
    storeState: TStoreState
  ) => TState | void;
}

export type ActionReducers<TState, TStoreState> = {
  [name: string]: ActionReducer<TState, TStoreState, ActionType<any>[]>;
};

export interface ReducerFactory<TState, TStoreState> {
  <TActions extends ActionType<any>[]>(
    opt: ActionReducer<TState, TStoreState, TActions>
  ): ActionReducer<TState, TStoreState, TActions>;
}

export interface CreateReducerFromActions<
  TNamespace extends string,
  TState,
  TStoreState
> {
  namespace: TNamespace;
  initialState: TState;
  storeState?: TStoreState;
  reducers(
    reducer: ReducerFactory<TState, TStoreState>
  ): ActionReducers<TState, TStoreState>;
}

export function createReducerFromActions<
  TNamespace extends string,
  TState,
  TStoreState
>({
  namespace,
  initialState,
  reducers,
}: CreateReducerFromActions<TNamespace, TState, TStoreState>): [
  Reducer<TNamespace, TState, TStoreState>,
  Selector<Record<TNamespace, TState>, [], TState>
] {
  const reducerEntries = Object.entries(reducers(identity));
  const reducer = {
    namespace,
    initialState,
    reduce(
      state: TState,
      action: Action<any>,
      storeState: TStoreState
    ): TState {
      let nextState: TState = state;
      for (let [name, reducer] of reducerEntries) {
        try {
          if (reducer.action.some(({ is }) => is(action))) {
            nextState =
              reducer.reduce(nextState, action, storeState) ?? nextState;
          }
        } catch (e) {
          throw new ReducerError(namespace, name, e);
        }
      }
      return nextState;
    },
  };

  const selector = createStateSelector<Record<TNamespace, TState>, [], TState>(
    (state) => state[namespace]
  );

  return [reducer, selector];
}
