import { Action, ActionFactory } from './action';
import produce from 'immer';
import { Slice, Store } from './store';

export interface Reducer<SLICE extends string, STATE, REQUIRED_STATE = {}> {
  slice: SLICE;
  reduce(
    state: STATE | undefined,
    action: Action,
    store: Store<REQUIRED_STATE & Slice<SLICE, STATE>>
  ): STATE;
}

export type On<STATE, PAYLOAD> = {
  action: ActionFactory<PAYLOAD>;
  reduce: (state: STATE, action: Action<PAYLOAD>) => STATE | void;
};

export function on<STATE, PAYLOAD>(
  action: ActionFactory<PAYLOAD>,
  reduce: (state: STATE, action: Action<PAYLOAD>) => STATE | void
): On<STATE, PAYLOAD> {
  return { action, reduce };
}

export type ReduceFunction<STATE, PAYLOAD = any, REQUIRED_STATE = {}> = (
  state: STATE,
  action: Action<PAYLOAD>,
  store: Store<REQUIRED_STATE>
) => STATE | void;

export class ReducerCombinator<SLICE extends string, STATE, REQUIRED_STATE>
  implements Reducer<SLICE, STATE, REQUIRED_STATE>
{
  private reducers: Record<string, ReduceFunction<STATE>> = {};

  constructor(readonly slice: SLICE, readonly initialState: STATE) {}

  reduce(
    state: STATE = this.initialState,
    action: Action,
    store: Store<REQUIRED_STATE & Slice<SLICE, STATE>>
  ): STATE {
    return produce(
      state,
      (draft: STATE) =>
        this.reducers[action.type]?.(draft, action, store as any) ?? draft
    );
  }

  add<PAYLOAD, ADD_REQUIRED_STATE = {}>(
    action: ActionFactory<PAYLOAD>,
    reduce: ReduceFunction<STATE, PAYLOAD, ADD_REQUIRED_STATE>
  ): ReducerCombinator<SLICE, STATE, REQUIRED_STATE & ADD_REQUIRED_STATE> {
    this.reducers[action.type] = reduce as any;
    return this as any;
  }
}

export function createReducer<SLICE extends string, STATE, REQUIRED_STATE = {}>(
  slice: SLICE,
  initialState: STATE
): ReducerCombinator<SLICE, STATE, REQUIRED_STATE> {
  return new ReducerCombinator<SLICE, STATE, REQUIRED_STATE>(
    slice,
    initialState
  );
}
