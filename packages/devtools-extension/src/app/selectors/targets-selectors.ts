import { targetsStore } from '@app/store/targets/store';
import { createStoreSelector } from '../../lib/state-fx/store/store-selector';

export const targetsSelector = createStoreSelector(targetsStore);
