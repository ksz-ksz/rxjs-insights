import { createActions } from '@lib/store';
import { TargetRef } from '@app/protocols/refs';

export interface TargetsActions {
  PinTarget: { target: TargetRef };
  UnpinTarget: { target: TargetRef };
  TargetsLoaded: { targets: TargetRef[] };
  TargetNotificationReceived: { target: TargetRef };
}

export const targetsActions = createActions<TargetsActions>('Targets');
