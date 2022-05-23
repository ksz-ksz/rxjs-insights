import { Context, createContext } from 'react';
import { Route } from './route';
import { Router } from './router';

export interface RouterOutletContextValue {
  currentRoute?: Route<any>;
  currentRouteIndex: number;
}

const contexts = new WeakMap<
  Router<any, any, any>,
  Context<RouterOutletContextValue>
>();

export function getRouterOutletContext(router: Router<any, any, any>) {
  const context = contexts.get(router);
  if (context === undefined) {
    const context = createContext<RouterOutletContextValue>({
      currentRouteIndex: 0,
    });
    contexts.set(router, context);
    return context;
  } else {
    return context;
  }
}
