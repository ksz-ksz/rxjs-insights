import { Action, ActionFactory, createActions } from './actions';
import { typeOf } from './type-of';
import { ExtractPayload, is } from './is';
import { identity } from 'rxjs';

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
  [TReducerName in keyof TReducers]: ActionFactory<
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
  const actions = createActions<ReducerPayloads<TReducers>>({
    namespace,
  });

  return [reducer, actions];
}

export interface ActionReducer<
  TState,
  TStoreState,
  TActions extends ActionFactory<any>[]
> {
  action: [...TActions];
  reduce: (
    state: TState,
    action: Action<ExtractPayload<TActions[number]>>,
    storeState: TStoreState
  ) => TState | void;
}

export type ActionReducers<TState, TStoreState> = {
  [name: string]: ActionReducer<TState, TStoreState, ActionFactory<any>[]>;
};

export interface ReducerFactory<TState, TStoreState> {
  <TActions extends ActionFactory<any>[]>(
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
}: CreateReducerFromActions<TNamespace, TState, TStoreState>): Reducer<
  TNamespace,
  TState,
  TStoreState
> {
  const reducerEntries = Object.entries(reducers(identity));
  return {
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
}
