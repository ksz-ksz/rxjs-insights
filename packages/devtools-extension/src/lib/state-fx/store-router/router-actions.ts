import { RouteObject } from './route-object';
import { Location } from './history';
import { ActionTypes, createActions } from '@lib/state-fx/store';
import { RouterState } from './router-store';

export interface ActivatedRouteEvent<
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  type: 'activate';
  deactivatedLocation: Location;
  activatedLocation: Location;
  activatedRoute: RouteObject<TParams, TSearch, THash>;
  activatedRoutes: RouteObject[];
  routerState: RouterState;
}

export interface DeactivatedRouteEvent<
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  type: 'deactivate';
  activatedLocation: Location;
  deactivatedLocation: Location;
  deactivatedRoute: RouteObject<TParams, TSearch, THash>;
  deactivatedRoutes: RouteObject[];
  routerState: RouterState;
}

export interface UpdatedRouteEvent<
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  type: 'activate-update' | 'deactivate-update';
  activatedLocation: Location;
  activatedRoute: RouteObject<TParams, TSearch, THash>;
  activatedRoutes: RouteObject[];
  deactivatedLocation: Location;
  deactivatedRoute: RouteObject<TParams, TSearch, THash>;
  deactivatedRoutes: RouteObject[];
  routerState: RouterState;
}

export type RouteEvent<TParams = unknown, TSearch = unknown, THash = unknown> =
  | ActivatedRouteEvent<TParams, TSearch, THash>
  | DeactivatedRouteEvent<TParams, TSearch, THash>
  | UpdatedRouteEvent<TParams, TSearch, THash>;

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

export interface StartCheckPhase {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes: RouteObject[];
}

export interface CompleteCheckPhase {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes: RouteObject[];
}

export interface StartCommitPhase {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes: RouteObject[];
}

export interface CompleteCommitPhase {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes: RouteObject[];
}

export interface CompleteNavigation {
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

export interface NavigationStarted {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes: RouteObject[];
}

export interface NavigationCompleted {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes: RouteObject[];
}

export interface NavigationCancelled {
  reason: 'overridden' | 'redirected' | 'intercepted';
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes?: RouteObject[];
}

export interface RouterActions {
  // commands
  navigate: NavigateCommand;
  startNavigation: NavigationCommand;
  startCheckPhase: NavigationCommand;
  completeCheckPhase: NavigationCommand;
  startCommitPhase: NavigationCommand;
  completeCommitPhase: NavigationCommand;
  completeNavigation: NavigationCommand;
  cancelNavigation: CancelNavigationCommand;

  // events
  navigationRequested: NavigationEvent;
  navigationStarted: NavigationEvent;
  checkPhaseStarted: NavigationEvent;
  checkPhaseCompleted: NavigationEvent;
  commitPhaseStarted: NavigationEvent;
  commitPhaseCompleted: NavigationEvent;
  navigationCompleted: NavigationEvent;
  navigationCancelled: NavigationCancelledEvent;
  routeChecked: RouteEvent;
  routeCommitted: RouteEvent;
}

export type RouterActionTypes = ActionTypes<RouterActions>;

export function createRouterActions(namespace: string): RouterActionTypes {
  return createActions<RouterActions>({ namespace });
}
