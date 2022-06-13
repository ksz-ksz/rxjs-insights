import { createSelector } from '@lib/store';
import { InsightsSlice } from '@app/store/insights';

export const insightsSelector = createSelector(
  (state: InsightsSlice) => state.insights
);

export const observableStateSelector = (observableId: number) =>
  createSelector(
    [insightsSelector],
    ([insights]) => insights.observables[observableId]
  );

export const subscriberStateSelector = (subscriberId: number) =>
  createSelector(
    [insightsSelector],
    ([insights]) => insights.subscribers[subscriberId]
  );

export const timeSelector = createSelector(
  [insightsSelector],
  ([insights]) => insights.time
);

export const playingSelector = createSelector(
  [insightsSelector],
  ([insights]) => insights.playing
);
