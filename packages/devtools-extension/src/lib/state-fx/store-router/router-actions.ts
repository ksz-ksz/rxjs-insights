import { Path, Update } from 'history';
import { ActiveRoute } from './active-route';

export interface ActivatedRouteEvent<TParams, TSearch, THash> {
  status: 'activated';
  activatedPath: Path;
  activatedRoute: ActiveRoute<TParams, TSearch, THash>;
  activatedRoutes: ActiveRoute<any, any, any>[];
}

export interface DeactivatedRouteEvent<TParams, TSearch, THash> {
  status: 'deactivated';
  deactivatedPath: Path;
  deactivatedRoute: ActiveRoute<TParams, TSearch, THash>;
  deactivatedRoutes: ActiveRoute<any, any, any>[];
}

export interface UpdatedRouteEvent<TParams, TSearch, THash> {
  status: 'updated';
  activatedPath: Path;
  activatedRoute: ActiveRoute<TParams, TSearch, THash>;
  activatedRoutes: ActiveRoute<any, any, any>[];
  deactivatedPath: Path | undefined;
  deactivatedRoute: ActiveRoute<TParams, TSearch, THash>;
  deactivatedRoutes: ActiveRoute<any, any, any>[];
}

export type RouteEvent<TParams, TSearch, THash> =
  | ActivatedRouteEvent<TParams, TSearch, THash>
  | DeactivatedRouteEvent<TParams, TSearch, THash>
  | UpdatedRouteEvent<TParams, TSearch, THash>;

export interface Navigate {
  path: Path;
  historyMode?: 'push' | 'replace';
  // TODO: we need a global Encoder defined in order to be able to merge/replace search/hash
  // searchMode?: 'merge' | 'replace';
  // hashMode?: 'merge' | 'replace';
}

type NavigationCompleted = {
  path: Path;
  routes: ActiveRoute<any, any, any>[];
};
type NavigationCanceled = {
  reason: any;
  path: Path;
  routes?: ActiveRoute<any, any, any>[];
};
type NavigationErrored = {
  reason: any;
  path: Path;
  routes?: ActiveRoute<any, any, any>[];
};
type NavigationStarted = {
  path: Path;
  routes: ActiveRoute<any, any, any>[];
};

export interface RouterActions {
  Navigate: Navigate;
  NavigationStarted: NavigationStarted;
  NavigationCompleted: NavigationCompleted;
  NavigationCanceled: NavigationCanceled;
  NavigationErrored: NavigationErrored;
  RouteResolved: RouteEvent<any, any, any>;
  RouteCommitted: RouteEvent<any, any, any>;
}
