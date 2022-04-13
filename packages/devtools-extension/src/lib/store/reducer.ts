import { Action, ActionFactory } from './action';

export interface Reducer<SLICE extends string, STATE> {
  slice: SLICE;
  reduce(state: STATE | undefined, action: Action): STATE;
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

export function createReducer<SLICE extends string, STATE>(
  slice: SLICE,
  initialState: STATE,
  ons: On<STATE, any>[]
): Reducer<SLICE, STATE> {
  const reducers = Object.fromEntries(
    ons.map((on) => [on.action.type, on.reduce])
  );

  return {
    slice,
    reduce(state: STATE = initialState, action: Action): STATE {
      return reducers[action.type]?.(state, action) ?? state;
    },
  };
}
