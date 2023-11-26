import { ResourceKey } from './resource-key';
import { hash } from '../hash';

export function getQueryHash(queryKey: ResourceKey, queryArgs: any) {
  return `${queryKey}::${hash(queryArgs)}`;
}