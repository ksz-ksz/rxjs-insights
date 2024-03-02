import { Location } from './history';
import { RouteObject } from './route-object';
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