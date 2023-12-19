import { Trace } from '@app/protocols/traces';
import { traceActions } from '@app/actions/trace-actions';
import {
  createStoreComponent,
  StoreDef,
  tx,
} from '../../../lib/state-fx/store/store';

export interface TraceState {
  trace?: Trace;
}

const initialState: TraceState = {
  trace: undefined,
};

export const traceStore = createStoreComponent(
  (): StoreDef<TraceState> => ({
    name: 'trace',
    state: initialState,
    transitions: {
      setState: tx([traceActions.TraceLoaded], (state, action) => {
        state.trace = action.payload.trace;
      }),
    },
  })
);
