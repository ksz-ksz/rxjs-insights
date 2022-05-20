import { on, Slice } from '@lib/store';
import { InstrumentationStatus } from '@app/protocols/instrumentation-status';
import { statusActions } from '@app/actions/status-actions';
import { createSlice } from '../../../lib/store/slice';

export const status = 'status';

export interface StatusState {
  instrumentationStatus: InstrumentationStatus | undefined;
}

export type StatusSlice = Slice<typeof status, StatusState>;

export const { reducer: statusReducer, selector: statusSelector } = createSlice(
  status,
  { instrumentationStatus: undefined } as StatusState,
  [
    on(statusActions.InstrumentationStatusResolved, (state, action) => {
      state.instrumentationStatus = action.payload.instrumentationStatus;
    }),
  ]
);
