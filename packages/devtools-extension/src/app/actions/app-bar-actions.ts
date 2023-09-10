import { createActions } from '@lib/state-fx/store';
import { TargetRef } from '@app/protocols/refs';

export interface AppBarActions {
  PinTarget: { target: TargetRef };
  UnpinTarget: { target: TargetRef };
  RefreshData: void;
}

export const appBarActions = createActions<AppBarActions>({
  namespace: 'AppBar',
});
