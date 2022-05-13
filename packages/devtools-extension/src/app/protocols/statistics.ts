import { RecorderStats } from '@rxjs-insights/core';

export const StatisticsChannel = 'StatisticsChannel';

export interface Statistics {
  getStats(): RecorderStats;
}
