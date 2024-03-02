import { Location } from './history';
import { RouteObject } from './route-object';

export interface ActivatedRouteCommand<
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  type: 'activate';
  deactivatedLocation: Location;
  activatedLocation: Location;
  activatedRoute: RouteObject<TParams, TSearch, THash>;
  activatedRoutes: RouteObject[];
}

export interface DeactivatedRouteCommand<
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  type: 'deactivate';
  activatedLocation: Location;
  deactivatedLocation: Location;
  deactivatedRoute: RouteObject<TParams, TSearch, THash>;
  deactivatedRoutes: RouteObject[];
}

export interface UpdatedRouteCommand<
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
}

export type RouteCommand<
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> =
  | ActivatedRouteCommand<TParams, TSearch, THash>
  | DeactivatedRouteCommand<TParams, TSearch, THash>
  | UpdatedRouteCommand<TParams, TSearch, THash>;
