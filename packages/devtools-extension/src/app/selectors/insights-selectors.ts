import { createSelector } from '@lib/store';
import { InsightsSlice } from '@app/store/insights';

export const insightsSelector = createSelector(
  (state: InsightsSlice) => state.insights
);

export const targetStateSelector = (targetId: number) =>
  createSelector(
    [insightsSelector],
    ([insights]) => insights.targets[targetId]
  );

export const targetUiStateSelector = (targetId: number) =>
  createSelector(
    [insightsSelector],
    ([insights]) => insights.targetsUi[targetId]
  );

export const playingSelector = createSelector(
  [insightsSelector],
  ([insights]) => insights.playing
);

export const followingSelector = createSelector(
  [insightsSelector],
  ([insights]) => insights.following
);

export const showExcludedEventsSelector = createSelector(
  [insightsSelector],
  ([insights]) => insights.showExcludedEvents
);
