import { createReducer, Slice } from '@lib/store';
import { InstrumentationStatus } from '@app/protocols/instrumentation-status';
import { statusActions } from '@app/actions/status-actions';

export interface StatusState {
  instrumentationStatus: InstrumentationStatus | 'not-connected' | undefined;
}

export type StatusSlice = Slice<'status', StatusState>;

export const statusReducer = createReducer('status', {
  instrumentationStatus: undefined,
} as StatusState).add(
  statusActions.InstrumentationStatusResolved,
  (state, action) => {
    state.instrumentationStatus = action.payload.instrumentationStatus;
  }
);
