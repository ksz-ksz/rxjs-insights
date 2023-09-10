import { filterRoute, RouteToken } from '@lib/store-router';
import { filter, map, pipe } from 'rxjs';
import { filterActions } from '@lib/store';
import { old_router } from '@app/old_router';
import {
  ActivatedRouteEvent,
  DeactivatedRouteEvent,
  Route,
  Router,
  UpdatedRouteEvent,
} from '@lib/state-fx/store-router';
import { Action } from '@lib/state-fx/store';

export function routeActivated<TParams, TSearch, THash>(
  router: Router<string, unknown>,
  route: Route<TParams, TSearch, THash>
) {
  return pipe(
    filter(router.actions.RouteCommitted.is),
    filter(
      (
        action
      ): action is Action<
        | ActivatedRouteEvent<TParams, TSearch, THash>
        | UpdatedRouteEvent<TParams, TSearch, THash>
      > =>
        (action.payload.status === 'activated' ||
          action.payload.status === 'updated') &&
        action.payload.activatedRoute.id === route.id
    ),
    map((action) => action.payload.activatedRoute)
  );
}

export function routeDeactivated<TParams, TSearch, THash>(
  router: Router<string, unknown>,
  route: Route<TParams, TSearch, THash>
) {
  return pipe(
    filter(router.actions.RouteCommitted.is),
    filter(
      (
        action
      ): action is Action<DeactivatedRouteEvent<TParams, TSearch, THash>> =>
        action.payload.status === 'deactivated' &&
        action.payload.deactivatedRoute.id === route.id
    ),
    map((action) => action.payload.deactivatedRoute)
  );
}

export const routeEnter = (token: RouteToken) =>
  pipe(
    filterActions(old_router.actions.RouteEnter),
    filterRoute(old_router, token)
  );

export const routeLeave = (token: RouteToken) =>
  pipe(
    filterActions(old_router.actions.RouteLeave),
    filterRoute(old_router, token)
  );
