import { selectInsightsState } from '@app/selectors/insights-selectors';
import { createStoreView } from '@lib/state-fx/store';
import { routerStore, selectRoute } from '@app/router';
import { targetRoute } from '@app/routes';
import { insightsStore } from '@app/store/insights/store';
import { createSuperSelector } from '../../lib/state-fx/store/super-selector';

export const activeTargetState = createStoreView({
  deps: [routerStore, insightsStore],
});

export const selectActiveTargetState = createSuperSelector(
  [selectRoute, selectInsightsState],
  (context) => {
    const targetId = selectRoute(context, targetRoute)?.params?.targetId;
    return targetId !== undefined
      ? selectInsightsState(context).targets[targetId]
      : undefined;
  }
);

export const selectActiveTarget = createSuperSelector(
  [selectActiveTargetState],
  (context) => {
    const activeTargetState = selectActiveTargetState(context);
    if (activeTargetState) {
      const { target } = activeTargetState;
      return target;
    } else {
      return undefined;
    }
  }
);

export const selectTargetUiState = createSuperSelector(
  [selectRoute, selectInsightsState],
  (context) => {
    const targetId = selectRoute(context, targetRoute)?.params?.targetId;
    return targetId !== undefined
      ? selectInsightsState(context).targetsUi[targetId]
      : undefined;
  }
);
