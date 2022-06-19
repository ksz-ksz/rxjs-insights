import { ObservableRef, SubscriberRef, TargetRef } from '@app/protocols/refs';

export const TargetsChannel = 'TargetsChannel';

export interface Targets {
  releaseTarget(targetId: number): void;
  getTargets(): TargetRef[];
}
