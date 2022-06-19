import { createActions } from '@lib/store';

export interface AppBarActions {
  RefreshData: void;
  CloseTarget: { targetId: number };
}

export const appBarActions = createActions<AppBarActions>('AppBar');
