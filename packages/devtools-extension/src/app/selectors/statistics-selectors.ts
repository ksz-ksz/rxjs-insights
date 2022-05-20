import { createSliceSelector } from '@lib/store';
import { StatisticsState } from '@app/store/statisctics';

export const statisticsSelector = createSliceSelector<
  'statistics',
  StatisticsState
>('statistics');
