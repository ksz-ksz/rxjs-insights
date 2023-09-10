import { createSelector } from '@lib/store';
import { old_router, targetRouteToken } from '@app/old_router';
import { insightsSelector } from '@app/selectors/insights-selectors';

export const activeTargetStateSelector = createSelector(
  [old_router.selectors.route(targetRouteToken), insightsSelector],
  ([route, insights]) =>
    route?.params?.targetId
      ? insights.targets[Number(route.params.targetId)]
      : undefined
);

export const activeTargetUiStateSelector = createSelector(
  [old_router.selectors.route(targetRouteToken), insightsSelector],
  ([route, insights]) =>
    route?.params?.targetId
      ? insights.targetsUi[Number(route.params.targetId)]
      : undefined
);
