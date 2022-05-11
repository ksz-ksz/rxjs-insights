import { createReducer, on } from '@lib/store';
import { status, StatusState } from '@app/store/status/slice';
import { statusActions } from '@app/store/status/actions';

export const statusReducer = createReducer(
  status,
  { instrumentationStatus: undefined } as StatusState,
  [
    on(statusActions.InstrumentationStatusResolved, (state, action) => {
      state.instrumentationStatus = action.payload.instrumentationStatus;
    }),
  ]
);
