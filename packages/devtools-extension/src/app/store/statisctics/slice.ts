import { on } from '@lib/store';
import { RecorderStats } from '@rxjs-insights/core';
import { createSlice } from '../../../lib/store/slice';
import { statisticsActions } from '@app/actions/statistics-actions';

export const statistics = 'statistics';

export interface StatisticsState {
  stats: RecorderStats | undefined;
}

export const { reducer: statisticsReducer, selector: statisticsSelector } =
  createSlice(statistics, { stats: undefined } as StatisticsState, [
    on(statisticsActions.StatsResolved, (state, action) => {
      state.stats = action.payload.stats;
    }),
  ]);
