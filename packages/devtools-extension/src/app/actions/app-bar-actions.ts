import { createActions } from '@lib/store';
import { TargetRef } from "@app/protocols/refs";

export interface AppBarActions {
  PinTarget: { target: TargetRef };
  UnpinTarget: { target: TargetRef };
  RefreshData: void;
}

export const appBarActions = createActions<AppBarActions>('AppBar');
