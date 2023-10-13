import { TargetRef } from '@app/protocols/refs';
import { createActions } from '@lib/state-fx/store';

export interface TargetsActions {
  TargetsLoaded: { targets: TargetRef[] };
  TargetNotificationReceived: { target: TargetRef };
}

export const targetsActions = createActions<TargetsActions>({
  namespace: 'Targets',
});
