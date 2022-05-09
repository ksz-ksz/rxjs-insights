import React, { useContext } from 'react';
import { RouterMetadata } from './router-metadata';
import { Router } from './router';
import { useRouterOutlet } from './use-router-outlet';
import { getRouterOutletContext } from './router-outlet-context';

export interface RouterOutletProps<DATA, METADATA extends RouterMetadata> {
  router: Router<DATA, METADATA>;
}

export function RouterOutlet<DATA, METADATA extends RouterMetadata>({
  router,
}: RouterOutletProps<DATA, METADATA>) {
  const RouterOutletContext = getRouterOutletContext(router);
  const { currentRouteIndex } = useContext(RouterOutletContext);
  const outlet = useRouterOutlet(router);
  if (outlet) {
    const Component = outlet.config.metadata?.component;
    if (Component) {
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
  }

  return null;
}
