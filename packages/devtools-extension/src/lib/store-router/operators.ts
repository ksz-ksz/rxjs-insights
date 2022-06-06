import { Router } from './router';
import { filter, map, OperatorFunction, pipe } from 'rxjs';
import { Action } from '@lib/store';
import { Route } from './route';
import { RouteToken } from './route-token';
import { declareOperator } from '@rxjs-insights/core/declarations';

export const filterRoute = declareOperator(function filterRoute<DATA>(
  router: Router<any, DATA, any>,
  routeToken: RouteToken
): OperatorFunction<Action<{ route: Route<DATA> }>, Route<DATA>> {
  return pipe(
    filter(
      (action) =>
        router.getRouteConfig(action.payload.route.routeConfigId)?.token ===
        routeToken
    ),
    map((action) => action.payload.route)
  );
});

export const filterRoutes = declareOperator(function filterRoutes<DATA>(
  router: Router<any, DATA, any>,
  routeToken: RouteToken
): OperatorFunction<Action<{ routes: Route<DATA>[] }>, Route<DATA>> {
  return pipe(
    map((action) =>
      action.payload.routes.find(
        (route) =>
          router.getRouteConfig(route.routeConfigId)?.token === routeToken
      )
    ),
    filter(Boolean)
  );
});
