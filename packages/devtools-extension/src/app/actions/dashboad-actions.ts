import { createActions } from '@lib/store';
import { TargetRef } from '@app/protocols/refs';

export interface DashboardActions {
  UnpinTarget: { target: TargetRef };
}

export const dashboardActions = createActions<DashboardActions>('AppBar');
