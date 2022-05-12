import { createActions } from '@lib/store';

export const routes = 'routes';

export interface RoutesActions {
  DashboardRouteEntered: void;
}

export const routesActions = createActions<RoutesActions>();
