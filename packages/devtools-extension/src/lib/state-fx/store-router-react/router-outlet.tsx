import {
  RouteContext,
  RouteObject,
  RouterComponent,
  RouterState,
} from '@lib/state-fx/store-router';
import { StoreComponent } from '@lib/state-fx/store';
import { ReactRouterData } from './react-router-data';
import { useComponent, useStoreState } from '@lib/state-fx/store-react';
import React, { useContext, useMemo } from 'react';

export interface RouterOutletProps {
  router: RouterComponent<ReactRouterData, unknown, unknown>;
  routerStore: StoreComponent<RouterState>;
}

function useRoutes(
  routerStoreComponent: StoreComponent<RouterState>
): RouteObject[] {
  const routerState = useStoreState(routerStoreComponent);
  return routerState.routes;
}

function useRouteContexts(
  routerComponent: RouterComponent<ReactRouterData, unknown, unknown>,
  routerStoreComponent: StoreComponent<RouterState>
): RouteContext<ReactRouterData>[] {
  const router = useComponent(routerComponent);
  const routes = useRoutes(routerStoreComponent);
  return useMemo(
    () =>
      routes.map((route) => ({
        route,
        routeConfig: router.getRouteConfig(route.id),
      })),
    [routes]
  );
}

interface RouterOutletContext {
  index: number;
}

const routerOutletContext = React.createContext<RouterOutletContext>({
  index: 0,
});

const RouterOutletContextProvider = routerOutletContext.Provider;

function findRouteWithComponent(
  routeContexts: RouteContext<ReactRouterData>[],
  index: number
) {
  let i = 0;
  for (const routeContext of routeContexts) {
    if (routeContext.routeConfig.data?.component !== undefined) {
      if (i === index) {
        return routeContext;
      } else {
        i++;
      }
    }
  }
  return undefined;
}

export function RouterOutlet(props: RouterOutletProps) {
  const { index } = useContext(routerOutletContext);
  const routeContexts = useRouteContexts(props.router, props.routerStore);
  const routeContext = useMemo(
    () => findRouteWithComponent(routeContexts, index),
    [routeContexts, index]
  );
  if (routeContext === undefined) {
    return null;
  }
  const Component = routeContext.routeConfig.data!.component!;
  return (
    <RouterOutletContextProvider value={{ index: index + 1 }}>
      <Component />
    </RouterOutletContextProvider>
  );
}
