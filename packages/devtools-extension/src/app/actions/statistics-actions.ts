import { createActions } from '@lib/store';
import { RecorderStats } from 'packages/core';

export interface StatisticsActions {
  StatsResolved: {
    stats: RecorderStats | undefined;
  };
}

export const statisticsActions = createActions<StatisticsActions>('Statistics');
