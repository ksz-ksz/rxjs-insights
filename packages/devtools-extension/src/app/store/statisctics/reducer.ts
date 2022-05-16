import { createReducer, on } from '@lib/store';
import { statistics, StatisticsState } from '@app/store/statisctics/slice';
import { statisticsActions } from '@app/actions/statistics-actions';

export const statisticsReducer = createReducer(
  statistics,
  { stats: undefined } as StatisticsState,
  [
    on(statisticsActions.StatsResolved, (state, action) => {
      state.stats = action.payload.stats;
    }),
  ]
);
