import { createActions } from '@lib/store';
import { targets } from '@app/store/targets/slice';
import { Target } from '@app/protocols/targets';

export interface TargetsActions {
  TargetsLoaded: { targets: Target[] };
  TargetNotificationReceived: { target: Target };
}

export const targetsActions = createActions<TargetsActions>(targets);
