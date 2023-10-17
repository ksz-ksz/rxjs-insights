import {
  createSelector,
  SelectorContext,
  SelectorState,
} from '@lib/state-fx/store';
import { createStoreSelector } from '../../lib/state-fx/store/store-selector';
import { insightsStore } from '@app/store/insights/store';

export const insightsSelector = createStoreSelector(insightsStore);

export const targetStateSelector = createSelector(
  (
    context: SelectorContext<SelectorState<typeof insightsSelector>>,
    targetId: number
  ) => {
    const insights = insightsSelector(context);
    return insights.targets[targetId];
  }
);

export const targetUiStateSelector = createSelector(
  (
    context: SelectorContext<SelectorState<typeof insightsSelector>>,
    targetId: number
  ) => {
    const insights = insightsSelector(context);
    return insights.targetsUi[targetId];
  }
);

export const playingSelector = createSelector(
  (context: SelectorContext<SelectorState<typeof insightsSelector>>) => {
    const insights = insightsSelector(context);
    return insights.playing;
  }
);

export const followingSelector = createSelector(
  (context: SelectorContext<SelectorState<typeof insightsSelector>>) => {
    const insights = insightsSelector(context);
    return insights.following;
  }
);

export const showExcludedEventsSelector = createSelector(
  (context: SelectorContext<SelectorState<typeof insightsSelector>>) => {
    const insights = insightsSelector(context);
    return insights.showExcludedEvents;
  }
);
