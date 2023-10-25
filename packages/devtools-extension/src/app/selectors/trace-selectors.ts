import { traceStore } from '@app/store/trace/store';
import { createStoreSuperSelector } from '../../lib/state-fx/store/super-selector';

export const selectTraceState = createStoreSuperSelector(traceStore);
