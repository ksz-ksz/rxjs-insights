import { Trace } from '@app/protocols/traces';
import { Slice } from '@lib/store';
import { traceActions } from '@app/actions/trace-actions';
import { createStore, tx } from '@lib/state-fx/store';

export interface TraceState {
  trace?: Trace;
}

export type TraceSlice = Slice<'trace', TraceState>;

const initialState: TraceState = {
  trace: undefined,
};

export const traceStore = createStore({
  namespace: 'trace',
  state: initialState,
})({
  setState: tx([traceActions.TraceLoaded], (state, action) => {
    state.trace = action.payload.trace;
  }),
});