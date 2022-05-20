import { createReducer, createSliceSelector, Slice } from '@lib/store';
import { RecorderStats } from '@rxjs-insights/core';
import { statisticsActions } from '@app/actions/statistics-actions';

export const statistics = 'statistics';

export interface StatisticsState {
  stats: RecorderStats | undefined;
}

export type StatisticsSlice = Slice<typeof statistics, StatisticsState>;

export const statisticsReducer = createReducer(statistics, {
  stats: undefined,
} as StatisticsState).add(statisticsActions.StatsResolved, (state, action) => {
  state.stats = action.payload.stats;
});

export const statisticsSelector = createSliceSelector(statisticsReducer);
