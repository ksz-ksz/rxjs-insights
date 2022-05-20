import { createSelector, createSliceSelector } from '@lib/store';
import { observableRoute, router, subscriberRoute } from '@app/store/router';
import { Target } from '@app/protocols/targets';
import { routerSelectors } from '@app/selectors/router-selectors';
import { TargetsState } from '@app/store/targets';

export const targetsSelector = createSliceSelector<'targets', TargetsState>(
  'targets'
);

export const activeTarget = createSelector(
  { routes: routerSelectors.routes },
  ({ routes }): Omit<Target, 'name'> | undefined => {
    for (let route of routes) {
      const routeConfig = router.getRouteConfig(route.routeConfigId);
      switch (routeConfig) {
        case observableRoute:
          return {
            type: 'observable',
            id: parseInt(route.params!.observableId, 10),
          };
        case subscriberRoute:
          return {
            type: 'subscriber',
            id: parseInt(route.params!.subscriberId, 10),
          };
      }
    }
    return undefined;
  }
);
