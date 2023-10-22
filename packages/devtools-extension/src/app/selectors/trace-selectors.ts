import { traceStore } from '@app/store/trace/store';
import { createStoreSelector } from '../../lib/state-fx/store/store-selector';

export const traceSelector = createStoreSelector(traceStore);
