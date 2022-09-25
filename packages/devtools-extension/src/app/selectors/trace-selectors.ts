import { createSelector } from '@lib/store';
import { TraceSlice } from '@app/store/trace/slice';

export const traceSelector = createSelector((state: TraceSlice) => state.trace);
