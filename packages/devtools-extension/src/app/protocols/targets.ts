export const TargetsChannel = 'TargetsChannel';

export interface Target {
  type: 'observable' | 'subscriber' | 'event';
  id: number;
  name: string;
}

export interface Targets {
  getTargets(): Target[];
}
