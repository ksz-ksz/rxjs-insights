import { Action, ActionFactory, createActions } from './actions';

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

export type ReducerPayload<TReducer> = TReducer extends ReducerFunction<any, any, infer TPayload> ? TPayload : never;

export type ReducerPayloads<TReducers> = {
  [TReducerName in keyof TReducers]: ReducerPayload<TReducers[TReducerName]>;
};

export type ReducerActions<TReducers> = {
  [TReducerName in keyof TReducers]: ActionFactory<ReducerPayload<TReducers[TReducerName]>>;
};

export interface CreateReducersOptions<TNamespace, TState, TStoreState, TReducers extends ReducerFunctions<TState, TStoreState>> {
  namespace: TNamespace;
  initialState: TState;
  storeState?: TStoreState;
  reducers: TReducers;
}

export function createReducer<TNamespace extends string, TState, TStoreState, TReducers extends ReducerFunctions<TState, TStoreState>>({
  namespace,
  initialState,
  reducers,
}: CreateReducersOptions<TNamespace, TState, TStoreState, TReducers>): [Reducer<TNamespace, TState, TStoreState>, ReducerActions<TReducers>] {
  const reducer: Reducer<TNamespace, TState, TStoreState> = {
    namespace,
    initialState,
    reduce(state: TState, action: Action<any>, storeState: TStoreState): TState {
      let nextState: TState = state;
      if (action.namespace === namespace) {
        const actionReducer = reducers[action.name];
        if (actionReducer !== undefined) {
          nextState = actionReducer(nextState, action.payload, storeState) ?? nextState;
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
