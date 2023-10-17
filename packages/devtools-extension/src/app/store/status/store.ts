import { InstrumentationStatus } from '@app/protocols/instrumentation-status';
import { statusActions } from '@app/actions/status-actions';
import { createStore, tx, typeOf } from '@lib/state-fx/store';

export interface StatusState {
  instrumentationStatus: InstrumentationStatus | 'not-connected' | undefined;
}

export const statusStore = createStore({
  namespace: 'status',
  state: typeOf<StatusState>({ instrumentationStatus: undefined }),
})({
  set: tx([statusActions.InstrumentationStatusResolved], (state, action) => {
    state.instrumentationStatus = action.payload.instrumentationStatus;
  }),
});
