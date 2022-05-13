import { Slice } from '@lib/store';
import { RecorderStats } from '@rxjs-insights/core';

export const statistics = 'statistics';

export interface StatisticsState {
  stats: RecorderStats | undefined;
}

export type StatisticsSlice = Slice<typeof statistics, StatisticsState>;
