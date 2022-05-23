import { Router } from './router';
import { RouteConfig } from './router-config';
import { useContext, useMemo } from 'react';
import { useSelector } from '@lib/store';
import { Route } from './route';
import { getRouterOutletContext } from './router-outlet-context';

export function useRouterOutlet<DATA>(
  router: Router<any, DATA, any>
): { route: Route<DATA>; config: RouteConfig<DATA, any> } | undefined {
  const routes = useSelector(router.selectors.routes);
  const RouterOutletContext = getRouterOutletContext(router);
  const { currentRouteIndex } = useContext(RouterOutletContext);
  return useMemo(
    () =>
      routes
        .map((route) => ({
          route,
          config: router.getRouteConfig(route.routeConfigId)!,
        }))
        .filter(({ config }) => config?.token !== undefined)[currentRouteIndex],
    [routes, currentRouteIndex]
  );
}
