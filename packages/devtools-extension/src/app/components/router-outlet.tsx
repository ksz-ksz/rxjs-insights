import React, { createContext, useContext } from 'react';
import { useSelector } from '@app/store';
import { getRouteConfig, routerSelectors } from '@app/store/router';

const CurrentRouteIndexContext = createContext<number>(0);

export function RouterOutlet() {
  const routes = useSelector(routerSelectors.routes);
  const currentRouteIndex = useContext(CurrentRouteIndexContext);
  const route = routes[currentRouteIndex];
  if (route) {
    const routeConfig = getRouteConfig(route.id);
    const Component = routeConfig?.metadata?.component;
    if (Component) {
      return (
        <CurrentRouteIndexContext.Provider value={currentRouteIndex + 1}>
          <Component />
        </CurrentRouteIndexContext.Provider>
      );
    }
  }

  return null;
}
