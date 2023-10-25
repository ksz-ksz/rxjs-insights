import { insightsStore } from '@app/store/insights/store';
import {
  createStoreSuperSelector,
  createSuperSelector,
} from '../../lib/state-fx/store/super-selector';

export const selectInsightsState = createStoreSuperSelector(insightsStore);

export const selectTargetState = createSuperSelector(
  [selectInsightsState],
  (context, targetId: number) => {
    const insights = selectInsightsState(context);
    return insights.targets[targetId];
  }
);

export const selectTargetUiState = createSuperSelector(
  [selectInsightsState],
  (context, targetId: number) => {
    const insights = selectInsightsState(context);
    return insights.targetsUi[targetId];
  }
);

export const selectPlaying = createSuperSelector(
  [selectInsightsState],
  (context) => {
    const insights = selectInsightsState(context);
    return insights.playing;
  }
);

export const selectFollowing = createSuperSelector(
  [selectInsightsState],
  (context) => {
    const insights = selectInsightsState(context);
    return insights.following;
  }
);

export const selectShowExcludedEvents = createSuperSelector(
  [selectInsightsState],
  (context) => {
    const insights = selectInsightsState(context);
    return insights.showExcludedEvents;
  }
);
