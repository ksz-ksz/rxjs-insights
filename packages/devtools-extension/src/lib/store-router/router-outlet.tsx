import React, { JSXElementConstructor, ReactNode, useContext } from 'react';
import { Router } from './router';
import { useRouterOutlet } from './use-router-outlet';
import { getRouterOutletContext } from './router-outlet-context';
import { RouteToken } from './route-token';

export interface RouterOutletProps<DATA> {
  router: Router<any, DATA, any>;
  token: RouteToken;
  component: JSXElementConstructor<any>;
}

export function RouterOutlet<DATA>({
  router,
  token,
  component: Component,
}: RouterOutletProps<DATA>) {
  const RouterOutletContext = getRouterOutletContext(router);
  const { currentRouteIndex } = useContext(RouterOutletContext);
  const outlet = useRouterOutlet(router);
  if (outlet?.config?.token === token) {
    return (
      <RouterOutletContext.Provider
        value={{
          currentRoute: outlet.route,
          currentRouteIndex: currentRouteIndex + 1,
        }}
      >
        <Component />
      </RouterOutletContext.Provider>
    );
  }

  return null;
}
