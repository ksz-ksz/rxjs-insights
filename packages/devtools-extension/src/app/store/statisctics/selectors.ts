import { createSelectors } from '@lib/store';
import { statistics, StatisticsState } from '@app/store/statisctics/slice';

export const statisticsSelectors = createSelectors(statistics, {
  stats(status: StatisticsState) {
    return status.stats;
  },
});
