import { createActions } from '@lib/store';
import { Target } from '@app/protocols/targets';

export interface AppBarActions {
  RefreshData: void;
  CloseTarget: { target: Target };
}

export const appBarActions = createActions<AppBarActions>('AppBar');
