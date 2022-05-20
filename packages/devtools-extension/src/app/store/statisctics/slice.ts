import { createReducer, Slice } from '@lib/store';
import { RecorderStats } from '@rxjs-insights/core';
import { statisticsActions } from '@app/actions/statistics-actions';

export interface StatisticsState {
  stats: RecorderStats | undefined;
}

export type StatisticsSlice = Slice<'statistics', StatisticsState>;

export const statisticsReducer = createReducer('statistics', {
  stats: undefined,
} as StatisticsState).add(statisticsActions.StatsResolved, (state, action) => {
  state.stats = action.payload.stats;
});
