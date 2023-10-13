import { createActions } from '@lib/state-fx/store';
import { TargetRef } from '@app/protocols/refs';

export interface DashboardActions {
  UnpinTarget: { target: TargetRef };
}

export const dashboardActions = createActions<DashboardActions>({
  namespace: 'AppBar',
});
