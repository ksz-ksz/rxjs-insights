import { createSelector } from '@lib/store';
import { router, targetRouteToken } from '@app/router';
import { TargetsSlice } from '@app/store/targets';

export const targetsSelector = createSelector(
  (state: TargetsSlice) => state.targets
);

export const activeTargetIdSelector = createSelector(
  [router.selectors.routes],
  ([routes]): number | undefined => {
    for (let route of routes) {
      const routeToken = router.getRouteConfig(route.routeConfigId)?.token;
      if (routeToken === targetRouteToken) {
        return Number(route.params!.targetId);
      }
    }
    return undefined;
  }
);

export const activeTargetSelector = createSelector(
  [activeTargetIdSelector, targetsSelector],
  ([activeTargetId, targets]) => {
    return targets.targets.find((target) => target.id === activeTargetId);
  }
);
