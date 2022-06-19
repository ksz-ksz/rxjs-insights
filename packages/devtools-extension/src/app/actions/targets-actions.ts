import { createActions } from '@lib/store';
import { TargetRef } from '@app/protocols/refs';

export interface TargetsActions {
  TargetsLoaded: { targets: TargetRef[] };
  TargetNotificationReceived: { target: TargetRef };
}

export const targetsActions = createActions<TargetsActions>('Targets');
