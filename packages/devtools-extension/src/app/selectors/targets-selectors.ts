import { createSelector } from '@lib/store';
import { TargetsSlice } from '@app/store/targets';

export const targetsSelector = createSelector(
  (state: TargetsSlice) => state.targets
);
