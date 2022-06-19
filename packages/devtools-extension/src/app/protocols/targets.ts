import { TargetRef } from '@app/protocols/refs';

export const TargetsChannel = 'TargetsChannel';

export interface Targets {
  addTarget(refId: number): void;
  releaseTarget(targetId: number): void;
  getTargets(): TargetRef[];
}
