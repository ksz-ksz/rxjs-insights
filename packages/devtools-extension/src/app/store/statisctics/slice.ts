import { Stats } from '@app/protocols/statistics';
import { Slice } from '@lib/store';

export const statistics = 'statistics';

export interface StatisticsState {
  stats: Stats | undefined;
}

export type StatisticsSlice = Slice<typeof statistics, StatisticsState>;
