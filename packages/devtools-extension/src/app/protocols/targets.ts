import { TargetRef } from '@app/protocols/refs';

export const TargetsChannel = 'TargetsChannel';

export interface Targets {
  addTarget(objectId: number): void;
  releaseTarget(targetId: number): void;
  getTargets(): TargetRef[];
}
