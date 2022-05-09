import { RouterMetadata } from './router-metadata';
import { Router } from './router';
import { RouteConfig } from './routing';
import { useContext, useMemo } from 'react';
import { useSelector } from '@lib/store';
import { Route } from './route';
import { getRouterOutletContext } from './router-outlet-context';

export function useRouterOutlet<DATA, METADATA extends RouterMetadata>(
  router: Router<DATA, METADATA>
): { route: Route<DATA>; config: RouteConfig<DATA, METADATA> } | undefined {
  const routes = useSelector(router.routes);
  const RouterOutletContext = getRouterOutletContext(router);
  const { currentRouteIndex } = useContext(RouterOutletContext);
  return useMemo(
    () =>
      routes
        .map((route) => ({
          route,
          config: router.getRouteConfig(route.id)!,
        }))
        .filter(({ config }) => config?.metadata?.component !== undefined)[
        currentRouteIndex
      ],
    [routes, currentRouteIndex]
  );
}
