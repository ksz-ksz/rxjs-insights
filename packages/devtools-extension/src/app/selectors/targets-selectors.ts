import { createSelector, createSliceSelector } from '@lib/store';
import {
  observableRouteToken,
  router,
  subscriberRouteToken,
} from '@app/router';
import { Target } from '@app/protocols/targets';
import { TargetsState } from '@app/store/targets';

export const targetsSelector = createSliceSelector<'targets', TargetsState>(
  'targets'
);

export const activeTarget = () =>
  createSelector(
    { routes: router.selectors.routes },
    ({ routes }): Omit<Target, 'name'> | undefined => {
      for (let route of routes) {
        const routeToken = router.getRouteConfig(route.routeConfigId)?.token;
        switch (routeToken) {
          case observableRouteToken:
            return {
              type: 'observable',
              id: parseInt(route.params!.observableId, 10),
            };
          case subscriberRouteToken:
            return {
              type: 'subscriber',
              id: parseInt(route.params!.subscriberId, 10),
            };
        }
      }
      return undefined;
    }
  );
