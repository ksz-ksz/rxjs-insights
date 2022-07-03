import { createActions } from '@lib/store';
import { TargetRef } from '@app/protocols/refs';

export interface ActiveTargetActions {
  ActiveTargetChanged: {
    target: TargetRef | undefined;
  };
}

export const activeTargetActions =
  createActions<ActiveTargetActions>('ActiveTarget');
