import { createReducer, createSliceSelector, Slice } from '@lib/store';
import { InstrumentationStatus } from '@app/protocols/instrumentation-status';
import { statusActions } from '@app/actions/status-actions';

export const status = 'status';

export interface StatusState {
  instrumentationStatus: InstrumentationStatus | undefined;
}

export type StatusSlice = Slice<typeof status, StatusState>;

export const statusReducer = createReducer(status, {
  instrumentationStatus: undefined,
} as StatusState).add(
  statusActions.InstrumentationStatusResolved,
  (state, action) => {
    state.instrumentationStatus = action.payload.instrumentationStatus;
  }
);

export const statusSelector = createSliceSelector(statusReducer);
