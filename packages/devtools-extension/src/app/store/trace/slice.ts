import { Trace } from '@app/protocols/traces';
import { createReducer, Slice } from '@lib/store';
import { traceActions } from '@app/actions/trace-actions';

export interface TraceState {
  trace?: Trace;
}

export type TraceSlice = Slice<'trace', TraceState>;

const initialState: TraceState = {
  trace: undefined,
};

export const traceReducer = createReducer('trace', initialState).add(
  traceActions.TraceLoaded,
  (state, action) => {
    state.trace = action.payload.trace;
  }
);
