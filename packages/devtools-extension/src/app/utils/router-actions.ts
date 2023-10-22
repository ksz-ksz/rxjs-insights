import { filter, map, Observable } from 'rxjs';
import {
  ActivatedRouteEvent,
  DeactivatedRouteEvent,
  Route,
  RouteObject,
  RouterActions,
  UpdatedRouteEvent,
} from '@lib/state-fx/store-router';
import {
  Action,
  Actions,
  ActionsSelector,
  ActionTypes,
} from '@lib/state-fx/store';

export function routeActivated<TParams, TSearch, THash>(
  routerActions: ActionTypes<RouterActions>,
  route: Route<TParams, TSearch, THash>
): ActionsSelector<Observable<RouteObject<TParams, TSearch, THash>>> {
  return {
    select(actions: Actions): Observable<RouteObject<TParams, TSearch, THash>> {
      return actions.ofType(routerActions.RouteCommitted).pipe(
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
    },
  };
}

export function routeDeactivated<TParams, TSearch, THash>(
  routerActions: ActionTypes<RouterActions>,
  route: Route<TParams, TSearch, THash>
): ActionsSelector<Observable<RouteObject<TParams, TSearch, THash>>> {
  return {
    select(actions: Actions): Observable<RouteObject<TParams, TSearch, THash>> {
      return actions.ofType(routerActions.RouteCommitted).pipe(
        filter(
          (
            action
          ): action is Action<DeactivatedRouteEvent<TParams, TSearch, THash>> =>
            action.payload.status === 'deactivated' &&
            action.payload.deactivatedRoute.id === route.id
        ),
        map((action) => action.payload.deactivatedRoute)
      );
    },
  };
}
