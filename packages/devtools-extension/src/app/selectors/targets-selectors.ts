import { targetsStore } from '@app/store/targets/store';
import { createStoreSuperSelector } from '../../lib/state-fx/store/super-selector';

export const selectTargetsState = createStoreSuperSelector(targetsStore);
