import { filterRoute, RouteToken } from '@lib/store-router';
import { pipe } from 'rxjs';
import { filterActions } from '@lib/store';
import { old_router } from '@app/old_router';

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
