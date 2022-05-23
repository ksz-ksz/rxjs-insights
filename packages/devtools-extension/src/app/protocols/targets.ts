export const TargetsChannel = 'TargetsChannel';

export interface Target {
  type: 'observable' | 'subscriber';
  id: number;
  name: string;
}

export interface Targets {
  releaseTarget(target: Target): void;
  getTargets(): Target[];
}
