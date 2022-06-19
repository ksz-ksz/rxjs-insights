import { createSelector } from '@lib/store';
import { router, targetRouteToken } from '@app/router';
import { insightsSelector } from '@app/selectors/insights-selectors';

export const activeTargetStateSelector = createSelector(
  [router.selectors.route(targetRouteToken), insightsSelector],
  ([route, insights]) =>
    route?.params?.targetId
      ? insights.targets[Number(route.params.targetId)]
      : undefined
);

export const activeTargetUiStateSelector = createSelector(
  [router.selectors.route(targetRouteToken), insightsSelector],
  ([route, insights]) =>
    route?.params?.targetId
      ? insights.targetsUi[Number(route.params.targetId)]
      : undefined
);
