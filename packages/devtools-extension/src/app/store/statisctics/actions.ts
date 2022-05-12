import { createActions } from '@lib/store';
import { statistics } from '@app/store/statisctics/slice';
import { Stats } from '@app/protocols/statistics';

export interface StatisticsActions {
  StatsResolved: {
    stats: Stats | undefined;
  };
}

export const statisticsActions = createActions<StatisticsActions>(statistics);
