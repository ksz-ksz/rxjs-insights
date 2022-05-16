import { Slice } from '@lib/store';
import { Target } from '@app/protocols/targets';

export const targets = 'targets';

export interface TargetsState {
  targets: Target[];
}

export type TargetsSlice = Slice<typeof targets, TargetsState>;
