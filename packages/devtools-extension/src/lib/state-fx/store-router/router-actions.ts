import { RouteObject } from './route-object';
import { Location } from './history';
import { ActionTypes } from '@lib/state-fx/store';

export interface ActivatedRouteEvent<TParams, TSearch, THash> {
  status: 'activated';
  activatedLocation: Location;
  activatedRoute: RouteObject<TParams, TSearch, THash>;
  activatedRoutes: RouteObject<any, any, any>[];
}

export interface DeactivatedRouteEvent<TParams, TSearch, THash> {
  status: 'deactivated';
  deactivatedLocation: Location;
  deactivatedRoute: RouteObject<TParams, TSearch, THash>;
  deactivatedRoutes: RouteObject<any, any, any>[];
}

export interface UpdatedRouteEvent<TParams, TSearch, THash> {
  status: 'updated';
  activatedLocation: Location;
  activatedRoute: RouteObject<TParams, TSearch, THash>;
  activatedRoutes: RouteObject<any, any, any>[];
  deactivatedLocation: Location | undefined;
  deactivatedRoute: RouteObject<TParams, TSearch, THash>;
  deactivatedRoutes: RouteObject<any, any, any>[];
}

export type RouteEvent<TParams, TSearch, THash> =
  | ActivatedRouteEvent<TParams, TSearch, THash>
  | DeactivatedRouteEvent<TParams, TSearch, THash>
  | UpdatedRouteEvent<TParams, TSearch, THash>;

export interface Navigate {
  location: Location;
  state?: any;
  historyMode?: 'push' | 'replace';
  // TODO: we need a global Encoder defined in order to be able to merge/replace search/hash
  // searchMode?: 'merge' | 'replace';
  // hashMode?: 'merge' | 'replace';
}

export interface NavigationRequested {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
}

export interface NavigationStarted {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes: RouteObject<any, any, any>[];
}

export interface NavigationCompleted {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes: RouteObject<any, any, any>[];
}

export interface NavigationCanceled {
  reason: 'overridden' | 'redirected' | 'intercepted';
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes?: RouteObject<any, any, any>[];
}

export interface RouterActions {
  Navigate: Navigate;
  NavigationRequested: NavigationRequested;
  NavigationStarted: NavigationStarted;
  NavigationCompleted: NavigationCompleted;
  NavigationCanceled: NavigationCanceled;
  // todo: rename to "checked"
  RouteResolved: RouteEvent<any, any, any>;
  RouteCommitted: RouteEvent<any, any, any>;
}

export type RouterActionTypes = ActionTypes<RouterActions>;
