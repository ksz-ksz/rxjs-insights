import { old_createSelector } from '@lib/store';
import { TraceSlice } from '@app/store/trace/slice';

export const traceSelector = old_createSelector(
  (state: TraceSlice) => state.trace
);
