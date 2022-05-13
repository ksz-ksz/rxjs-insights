import { createActions } from '@lib/store';

export interface AppBarActions {
  RefreshDataButtonClicked: void;
}

export const appBarActions = createActions<AppBarActions>();
