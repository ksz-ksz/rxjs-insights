import { createRouteActions } from '@lib/state-fx/store-router';
import { dashboardRoute, targetRoute } from '@app/routes';

export const dashboardRouteActions = createRouteActions(
  'router',
  dashboardRoute
);
export const targetRouteActions = createRouteActions('router', targetRoute);