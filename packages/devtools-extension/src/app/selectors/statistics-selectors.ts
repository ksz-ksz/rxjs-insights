import { createSelector } from '@lib/store';
import { StatisticsSlice } from '@app/store/statisctics';

export const statisticsSelector = createSelector(
  (state: StatisticsSlice) => state.statistics
);
