import { createSelector } from '@lib/store';
import { targets, TargetsState } from '@app/store/targets/slice';

export const targetsSelectors = {
  targets: createSelector((state: TargetsState) => state.targets, targets),
};
