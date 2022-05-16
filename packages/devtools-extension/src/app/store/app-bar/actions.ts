import { createActions } from '@lib/store';
import { Target } from '@app/protocols/targets';

export interface AppBarActions {
  RefreshDataButtonClicked: void;
  TargetClosed: { target: Target };
}

export const appBarActions = createActions<AppBarActions>();
