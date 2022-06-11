import { createSelector, createSliceSelector } from '@lib/store';
import { InsightsState } from '@app/store/insights';

export const insightsSelector = createSliceSelector<'insights', InsightsState>(
  'insights'
);

export const observableStateSelector = (observableId: number) =>
  createSelector(
    {
      insights: insightsSelector,
    },
    ({ insights }) => insights.observables[observableId]
  );

export const subscriberStateSelector = (subscriberId: number) =>
  createSelector(
    {
      insights: insightsSelector,
    },
    ({ insights }) => insights.subscribers[subscriberId]
  );

export const timeSelector = createSelector(
  { insights: insightsSelector },
  ({ insights }) => insights.time
);

export const playingSelector = createSelector(
  { insights: insightsSelector },
  ({ insights }) => insights.playing
);
