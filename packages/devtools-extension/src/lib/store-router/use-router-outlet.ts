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
  return useMemo(() => {
    const result = routes
      .map((route) => ({
        route,
        config: router.getRouteConfig(route.routeConfigId)!,
      }))
      .filter(({ config }) => config?.metadata?.component !== undefined)[
      currentRouteIndex
    ];
    console.log('useRouterOutlet', {
      result,
      routes,
      currentRouteIndex,
      router,
    });
    return result;
  }, [routes, currentRouteIndex]);
}
