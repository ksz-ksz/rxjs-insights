import { ResourceKey } from './resource-key';
import { Fn } from './fn';
import { Action, ActionTypeFns, createActions } from '@lib/state-fx/store';
import { Result } from './result';

interface InactiveQueryOptions {
  cacheTime?: number;
}

export interface QueryOptions {
  cacheTime?: number;
  staleTime?: number;
}

export interface MutationOptions {
  cacheTime?: number;
}

export type SetQueryData<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryData: ReturnType<T>;
  queryOptions?: InactiveQueryOptions;
};
export type PreloadQuery<T extends Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryOptions?: InactiveQueryOptions;
};
export type Query<T extends Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryOptions?: InactiveQueryOptions;
};
export type InvalidateQueries = {
  queryKeys: ResourceKey[];
};
export type CancelQueries = {
  queryKeys: ResourceKey[];
};
export type SubscribeQuery<T extends Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryOptions?: QueryOptions;
};
export type UnsubscribeQuery<T extends Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};
type QuerySubscribed<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};
type QueryUnsubscribed<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};
type QueryStarted<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};
export type QueryCompleted<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryResult: Result<ReturnType<T>>;
};
export type SubscribeMutation = {
  mutatorKey: string;
  mutationKey: ResourceKey;
  mutationOptions?: MutationOptions;
};
export type UnsubscribeMutation = {
  mutatorKey: string;
  mutationKey: ResourceKey;
};
export type Mutate<T extends Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
};
type MutationStarted<T extends Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
};
export type MutationCompleted<T extends Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
  mutationResult: Result<ReturnType<T>>;
};

export interface ResourceActions {
  // cache manipulation
  query<T extends Fn>(payload: Query<T>): Action<Query<T>>;

  preloadQuery<T extends Fn>(payload: PreloadQuery<T>): Action<PreloadQuery<T>>;

  setQueryData<T extends Fn>(payload: SetQueryData<T>): Action<SetQueryData<T>>;

  invalidateQueries(payload: InvalidateQueries): Action<InvalidateQueries>;

  cancelQueries(payload: CancelQueries): Action<CancelQueries>;

  // queries activation
  subscribeQuery<T extends Fn>(
    payload: SubscribeQuery<T>
  ): Action<SubscribeQuery<T>>;

  unsubscribeQuery<T extends Fn>(
    payload: UnsubscribeQuery<T>
  ): Action<UnsubscribeQuery<T>>;

  // queries lifecycle
  querySubscribed<T extends Fn>(
    payload: QuerySubscribed<T>
  ): Action<QuerySubscribed<T>>;

  queryUnsubscribed<T extends Fn>(
    payload: QueryUnsubscribed<T>
  ): Action<QueryUnsubscribed<T>>;

  queryStarted<T extends Fn>(payload: QueryStarted<T>): Action<QueryStarted<T>>;

  queryCompleted<T extends Fn>(
    payload: QueryCompleted<T>
  ): Action<QueryCompleted<T>>;

  // mutations activation
  subscribeMutation(payload: SubscribeMutation): Action<SubscribeMutation>;

  unsubscribeMutation(
    payload: UnsubscribeMutation
  ): Action<UnsubscribeMutation>;

  mutate<T extends Fn>(payload: Mutate<T>): Action<Mutate<T>>;

  // mutations lifecycle
  mutationStarted<T extends Fn>(
    payload: MutationStarted<T>
  ): Action<MutationStarted<T>>;

  mutationCompleted<T extends Fn>(
    payload: MutationCompleted<T>
  ): Action<MutationCompleted<T>>;
}

export interface ResourceActionTypes extends ActionTypeFns<ResourceActions> {}

export function createResourceActions(namespace: string): ResourceActionTypes {
  return createActions({ namespace }) as any;
}
