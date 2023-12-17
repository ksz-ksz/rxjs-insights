import { ResourceKey } from './resource-key';
import { MutationState, ResourceState } from './resource-store';
import { getMutationHash } from './get-mutation-hash';

export function getMutation(
  state: ResourceState,
  mutationKey: ResourceKey,
  mutatorKey: string
): { mutationHash: string; mutationState: MutationState };
export function getMutation(
  state: ResourceState,
  mutationKey: ResourceKey,
  mutatorKey: string,
  required: true
): { mutationHash: string; mutationState: MutationState };
export function getMutation(
  state: ResourceState,
  mutationKey: ResourceKey,
  mutatorKey: string,
  required: false
): { mutationHash: string; mutationState: MutationState | undefined };

export function getMutation(
  state: ResourceState,
  mutationKey: ResourceKey,
  mutatorKey: string,
  required: boolean = true
): { mutationHash: string; mutationState: MutationState | undefined } {
  const mutationHash = getMutationHash(mutationKey, mutatorKey);
  const mutationState = state.mutations[mutationHash];
  if (required && mutationState === undefined) {
    throw new Error('no mutation state');
  }
  return { mutationHash, mutationState };
}
