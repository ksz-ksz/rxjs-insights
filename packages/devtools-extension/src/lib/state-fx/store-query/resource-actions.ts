import { ResourceKey } from './resource-key';
import { Fn } from './fn';
import { Action, ActionTypeFns, createActions } from '../store';
import { Result } from './result';
import { QueryState } from './resource-store';

export interface VolatileQueryOptions {
  cacheTime: number;
}

export interface QueryOptions {
  cacheTime: number;
  staleTime: number;
}

export interface MutationOptions {
  cacheTime: number;
}

export type SetQuery<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryData: ReturnType<T>;
  queryOptions?: VolatileQueryOptions;
};
export type ForceQuery<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryOptions?: VolatileQueryOptions;
};
export type InvalidateQuery<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};
export type CancelQuery<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};

export type StartQuery<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};

export type CompleteQuery<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryResult: Result<ReturnType<T>>;
};

export type CleanupQuery<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};

export type SubscribeQuery<T extends Fn = Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  // queryHash: string;
  queryOptions?: Partial<QueryOptions>;
};

export type UnsubscribeQuery<T extends Fn = Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};

type QueryForced<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryHash: string;
  queryState: QueryState<ReturnType<T>>;
};

type QuerySubscribed<T extends Fn = Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryHash: string;
  queryState: QueryState<ReturnType<T>>;
};
type QueryUnsubscribed<T extends Fn = Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryHash: string;
  queryState: QueryState<ReturnType<T>>;
};
type QueryCleanedUp<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryHash: string;
};
type QueryInvalidated<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryHash: string;
  queryState: QueryState<ReturnType<T>>;
};
type QueryStarted<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryHash: string;
  queryState: QueryState<ReturnType<T>>;
};
export type QueryCompleted<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryHash: string;
  queryResult: Result<ReturnType<T>>;
  queryState: QueryState<ReturnType<T>>;
};
type QueryCancelled<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryHash: string;
  queryState: QueryState<ReturnType<T>>;
};
export type SubscribeMutation = {
  mutatorKey: string;
  mutationKey: ResourceKey;
  mutationOptions?: Partial<MutationOptions>;
};
export type UnsubscribeMutation = {
  mutatorKey: string;
  mutationKey: ResourceKey;
};
export type Mutate<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
};
type MutationStarted<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
};
export type MutationCompleted<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
  mutationResult: Result<ReturnType<T>>;
};

export interface ResourceActions {
  // queries activation
  forceQuery<T extends Fn>(payload: ForceQuery<T>): Action<ForceQuery<T>>;

  setQuery<T extends Fn>(payload: SetQuery<T>): Action<SetQuery<T>>;

  invalidateQuery<T extends Fn>(
    payload: InvalidateQuery<T>
  ): Action<InvalidateQuery<T>>;

  cancelQuery<T extends Fn>(payload: CancelQuery<T>): Action<CancelQuery<T>>;

  startQuery<T extends Fn>(payload: StartQuery<T>): Action<StartQuery<T>>;
  completeQuery<T extends Fn>(
    payload: CompleteQuery<T>
  ): Action<CompleteQuery<T>>;

  cleanupQuery<T extends Fn>(payload: CleanupQuery<T>): Action<CleanupQuery<T>>;

  subscribeQuery<T extends Fn>(
    payload: SubscribeQuery<T>
  ): Action<SubscribeQuery<T>>;

  unsubscribeQuery<T extends Fn>(
    payload: UnsubscribeQuery<T>
  ): Action<UnsubscribeQuery<T>>;

  // queries lifecycle
  queryForced<T extends Fn>(payload: QueryForced<T>): Action<QueryForced<T>>;

  querySubscribed<T extends Fn>(
    payload: QuerySubscribed<T>
  ): Action<QuerySubscribed<T>>;

  queryUnsubscribed<T extends Fn>(
    payload: QueryUnsubscribed<T>
  ): Action<QueryUnsubscribed<T>>;

  queryCleanedUp<T extends Fn>(
    payload: QueryCleanedUp<T>
  ): Action<QueryCleanedUp<T>>;

  queryInvalidated<T extends Fn>(
    payload: QueryInvalidated<T>
  ): Action<QueryInvalidated<T>>;

  queryStarted<T extends Fn>(payload: QueryStarted<T>): Action<QueryStarted<T>>;

  queryCompleted<T extends Fn>(
    payload: QueryCompleted<T>
  ): Action<QueryCompleted<T>>;

  queryCancelled<T extends Fn>(
    payload: QueryCancelled<T>
  ): Action<QueryCancelled<T>>;

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
