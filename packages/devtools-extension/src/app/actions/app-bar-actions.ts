import { createActions } from '@lib/store';

export interface AppBarActions {
  RefreshData: void;
}

export const appBarActions = createActions<AppBarActions>('AppBar');
