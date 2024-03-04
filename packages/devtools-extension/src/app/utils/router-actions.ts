import { filter, map, Observable } from 'rxjs';
import {
  ActivatedRouteEvent,
  DeactivatedRouteEvent,
  RouteActionTypes,
  RouteObject,
  UpdatedRouteEvent,
} from '@lib/state-fx/store-router';
import { Action, Actions, ActionsSelector } from '@lib/state-fx/store';

// TODO: needs to ignore updates
export function routeActivated<TParams, TSearch, THash>(
  routeActions: RouteActionTypes<TParams, TSearch, THash>
): ActionsSelector<Observable<RouteObject<TParams, TSearch, THash>>> {
  return {
    select(actions: Actions): Observable<RouteObject<TParams, TSearch, THash>> {
      return actions.ofType(routeActions.routePrepared).pipe(
        filter(
          (
            action
          ): action is Action<
            | ActivatedRouteEvent<TParams, TSearch, THash>
            | UpdatedRouteEvent<TParams, TSearch, THash>
          > =>
            action.payload.type === 'activate' ||
            action.payload.type === 'activate-update'
        ),
        map((action) => action.payload.activatedRoute)
      );
    },
  };
}

function areArraysEqual<T>(a: T[], b: T[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// TODO: needs to ignore updates
export function routeDeactivated<TParams, TSearch, THash>(
  routeActions: RouteActionTypes<TParams, TSearch, THash>,
  {
    ignoreParamsChanges = true,
    ignoreHashChanges = false,
    ignoreSearchChanges = false,
  }: {
    ignoreParamsChanges?: boolean;
    ignoreHashChanges?: boolean;
    ignoreSearchChanges?: boolean;
  } = {}
): ActionsSelector<Observable<RouteObject<TParams, TSearch, THash>>> {
  return {
    select(actions: Actions): Observable<RouteObject<TParams, TSearch, THash>> {
      return actions.ofType(routeActions.routePrepared).pipe(
        filter(
          (
            action
          ): action is Action<
            DeactivatedRouteEvent<TParams, TSearch, THash>
          > => {
            switch (action.payload.type) {
              case 'deactivate':
                return true;
              case 'deactivate-update':
                return (
                  (!ignoreParamsChanges ||
                    areArraysEqual(
                      action.payload.deactivatedRoute.path,
                      action.payload.activatedRoute.path
                    )) &&
                  (!ignoreSearchChanges ||
                    action.payload.deactivatedLocation.search ===
                      action.payload.activatedLocation.search) &&
                  (!ignoreHashChanges ||
                    action.payload.deactivatedLocation.hash ===
                      action.payload.activatedLocation.hash)
                );
              default:
                return false;
            }
          }
        ),
        map((action) => action.payload.deactivatedRoute)
      );
    },
  };
}
