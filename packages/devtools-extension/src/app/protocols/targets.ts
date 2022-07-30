import { TargetRef } from '@app/protocols/refs';

export const TargetsChannel = 'TargetsChannel';

export interface Targets {
  lockTarget(objectId: number): void;
  unlockTarget(objectId: number): void;
  pinTarget(objectId: number): void;
  unpinTarget(objectId: number): void;
  getTargets(): TargetRef[];
}
