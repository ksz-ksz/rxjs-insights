import { old_createSelector } from '@lib/store';
import { TraceSlice } from '@app/store/trace/store';

export const traceSelector = old_createSelector(
  (state: TraceSlice) => state.trace
);
