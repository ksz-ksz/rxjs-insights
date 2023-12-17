import { ResourceKey } from './resource-key';

export function getMutationHash(mutationKey: ResourceKey, mutatorKey: string) {
  return `${mutationKey}::${mutatorKey}`;
}
