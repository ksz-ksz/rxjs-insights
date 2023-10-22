import {
  RouteContext,
  RouteObject,
  RouterComponent,
  RouterState,
} from '@lib/state-fx/store-router';
import { StoreComponent } from '@lib/state-fx/store';
import { RouterData } from './router-data';
import { useComponent } from '@lib/state-fx/store-react';
import React, { useContext, useMemo } from 'react';
import { useStoreOwnState } from '../store-react/use-store-own-state';

export interface RouterOutletProps {
  router: RouterComponent<RouterData, unknown, unknown>;
  routerStore: StoreComponent<string, RouterState>;
}

function useRoutes(
  routerStoreComponent: StoreComponent<string, RouterState>
): RouteObject[] {
  const routerState = useStoreOwnState(routerStoreComponent);
  return routerState.routes;
}

function useRouteContexts(
  routerComponent: RouterComponent<RouterData, unknown, unknown>,
  routerStoreComponent: StoreComponent<string, RouterState>
): RouteContext<RouterData>[] {
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
  routeContexts: RouteContext<RouterData>[],
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
