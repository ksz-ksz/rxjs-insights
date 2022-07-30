import { filterRoute, RouteToken } from '@lib/store-router';
import { pipe } from 'rxjs';
import { filterActions } from '@lib/store';
import { router } from '@app/router';

export const routeEnter = (token: RouteToken) =>
  pipe(filterActions(router.actions.RouteEnter), filterRoute(router, token));

export const routeLeave = (token: RouteToken) =>
  pipe(filterActions(router.actions.RouteLeave), filterRoute(router, token));
