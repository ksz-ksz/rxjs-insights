import { ResourceKey } from './resource-key';
import { QueryState, ResourceState } from './resource-store';
import { getQueryHash } from './get-query-hash';

export function getQuery(
  state: ResourceState,
  queryKey: ResourceKey,
  queryArgs: any[]
): { queryHash: string; queryState: QueryState };
export function getQuery(
  state: ResourceState,
  queryKey: ResourceKey,
  queryArgs: any[],
  required: true
): { queryHash: string; queryState: QueryState };
export function getQuery(
  state: ResourceState,
  queryKey: ResourceKey,
  queryArgs: any[],
  required: false
): { queryHash: string; queryState: QueryState | undefined };
export function getQuery(
  state: ResourceState,
  queryKey: ResourceKey,
  queryArgs: any[],
  required: boolean = true
): { queryHash: string; queryState: QueryState | undefined } {
  const queryHash = getQueryHash(queryKey, queryArgs);
  const queryState = state.queries[queryHash];
  if (required && queryState === undefined) {
    throw new Error('no query state');
  }
  return { queryHash, queryState };
}
