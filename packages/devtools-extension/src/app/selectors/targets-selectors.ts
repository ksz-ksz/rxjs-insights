import { old_createSelector } from '@lib/store';
import { TargetsSlice } from '@app/store/targets';

export const targetsSelector = old_createSelector(
  (state: TargetsSlice) => state.targets
);
