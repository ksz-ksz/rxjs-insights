import { RouteObject } from './route-object';
import { Location } from './history';
import { ActionTypes, createActions } from '@lib/state-fx/store';
import { RouterState } from './router-store';
import { RouteEvent } from './route-event';
import { Route } from './route';

export interface NavigateCommand {
  location: Location;
  state?: any;
  historyMode?: 'push' | 'replace';
  // TODO: we need a global Encoder defined in order to be able to merge/replace search/hash
  // searchMode?: 'merge' | 'replace';
  // hashMode?: 'merge' | 'replace';
}

export interface NavigationCommand {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes: RouteObject[];
}

export interface CancelNavigationCommand {
  reason: any;
}

export interface NavigationEvent {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routerState: RouterState;
}

export interface NavigationCancelledEvent {
  reason: string;
  routerState: RouterState;
}

export interface RouterActions {
  // commands
  navigate: NavigateCommand;
  startNavigation: NavigationCommand;
  completeCheck: NavigationCommand;
  completePrepare: NavigationCommand;
  completeNavigation: NavigationCommand;
  cancelNavigation: CancelNavigationCommand;

  // events
  navigationRequested: NavigationEvent;
  navigationStarted: NavigationEvent;
  navigationChecked: NavigationEvent;
  navigationPrepared: NavigationEvent;
  navigationCompleted: NavigationEvent;
  navigationCancelled: NavigationCancelledEvent;
}

export type RouterActionTypes = ActionTypes<RouterActions>;

export interface RouteActions<TParams, TSearch, THash> {
  routeChecked: RouteEvent<TParams, TSearch, THash>;
  routePrepared: RouteEvent<TParams, TSearch, THash>;
  routeCommitted: RouteEvent<TParams, TSearch, THash>;
}

export type RouteActionTypes<TParams, TSearch, THash> = ActionTypes<
  RouteActions<TParams, TSearch, THash>
>;

export function createRouterActions(namespace: string): RouterActionTypes {
  return createActions<RouterActions>({ namespace });
}

export function createRouteActions<TParams, TSearch, THash>(
  namespace: string,
  route: Route<TParams, TSearch, THash>
): RouteActionTypes<TParams, TSearch, THash> {
  return createActions<RouteActions<TParams, TSearch, THash>>({
    namespace,
    createName: (name) => `${name}/${route.id}`,
  });
}
