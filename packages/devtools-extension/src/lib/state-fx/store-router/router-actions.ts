import { ActiveRoute } from './active-route';
import { Location } from './history';

export interface ActivatedRouteEvent<TParams, TSearch, THash> {
  status: 'activated';
  activatedLocation: Location;
  activatedRoute: ActiveRoute<TParams, TSearch, THash>;
  activatedRoutes: ActiveRoute<any, any, any>[];
}

export interface DeactivatedRouteEvent<TParams, TSearch, THash> {
  status: 'deactivated';
  deactivatedLocation: Location;
  deactivatedRoute: ActiveRoute<TParams, TSearch, THash>;
  deactivatedRoutes: ActiveRoute<any, any, any>[];
}

export interface UpdatedRouteEvent<TParams, TSearch, THash> {
  status: 'updated';
  activatedLocation: Location;
  activatedRoute: ActiveRoute<TParams, TSearch, THash>;
  activatedRoutes: ActiveRoute<any, any, any>[];
  deactivatedLocation: Location | undefined;
  deactivatedRoute: ActiveRoute<TParams, TSearch, THash>;
  deactivatedRoutes: ActiveRoute<any, any, any>[];
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
  routes: ActiveRoute<any, any, any>[];
}

export interface NavigationCompleted {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes: ActiveRoute<any, any, any>[];
}

export interface NavigationCanceled {
  reason: 'overridden' | 'redirected' | 'intercepted';
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes?: ActiveRoute<any, any, any>[];
}

export interface RouterActions {
  Navigate: Navigate;
  NavigationRequested: NavigationRequested;
  NavigationStarted: NavigationStarted;
  NavigationCompleted: NavigationCompleted;
  NavigationCanceled: NavigationCanceled;
  RouteResolved: RouteEvent<any, any, any>;
  RouteCommitted: RouteEvent<any, any, any>;
}
