import { ResourceKey } from './resource-key';
import { Fn } from './fn';
import { Action, ActionTypeFns, createActions } from '../store';
import { Result } from './result';
import { QueryState } from './resource-store';

export interface QueryOptions {
  cacheTime: number;
  staleTime: number;
}

export interface QuerySubscriberOptions {
  staleTime: number;
}

export interface MutationOptions {
  cacheTime: number;
}

export type SetQuery<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryData: ReturnType<T>;
};
export type PrefetchQuery<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};
export type FetchQuery<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
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

export type CollectQuery<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};

export type StaleQuery<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};

export type SubscribeQuery<T extends Fn = Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};

export type UnsubscribeQuery<T extends Fn = Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};

type QueryPrefetched<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryHash: string;
  queryState: QueryState<ReturnType<T>>;
};

type QueryFetched<T extends Fn = Fn> = {
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
type QueryStaled<T extends Fn = Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryHash: string;
};
type QueryCollected<T extends Fn = Fn> = {
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

  /**
   * Adds a subscriber to the query.
   */
  subscribeQuery<T extends Fn>(
    payload: SubscribeQuery<T>
  ): Action<SubscribeQuery<T>>;

  /**
   * Removes a subscriber from the query.
   */
  unsubscribeQuery<T extends Fn>(
    payload: UnsubscribeQuery<T>
  ): Action<UnsubscribeQuery<T>>;

  /**
   * If there was no data for the query fetched yet, fetches the data.
   */
  prefetchQuery<T extends Fn>(
    payload: PrefetchQuery<T>
  ): Action<PrefetchQuery<T>>;

  /**
   * Fetches the data, even if there are no subscribers for the query.
   */
  fetchQuery<T extends Fn>(payload: FetchQuery<T>): Action<FetchQuery<T>>;

  /**
   * Forces query into a stale state. If there are active subscribers, fetches the data.
   */
  invalidateQuery<T extends Fn>(
    payload: InvalidateQuery<T>
  ): Action<InvalidateQuery<T>>;

  /**
   * Sets query data.
   */
  setQuery<T extends Fn>(payload: SetQuery<T>): Action<SetQuery<T>>;

  // effect -> store communication
  startQuery<T extends Fn>(payload: StartQuery<T>): Action<StartQuery<T>>;
  cancelQuery<T extends Fn>(payload: CancelQuery<T>): Action<CancelQuery<T>>;
  completeQuery<T extends Fn>(
    payload: CompleteQuery<T>
  ): Action<CompleteQuery<T>>;
  collectQuery<T extends Fn>(payload: CollectQuery<T>): Action<CollectQuery<T>>;
  staleQuery<T extends Fn>(payload: StaleQuery<T>): Action<StaleQuery<T>>;
  // queries lifecycle
  queryPrefetched<T extends Fn>(
    payload: QueryPrefetched<T>
  ): Action<QueryPrefetched<T>>;
  queryFetched<T extends Fn>(payload: QueryFetched<T>): Action<QueryFetched<T>>;

  querySubscribed<T extends Fn>(
    payload: QuerySubscribed<T>
  ): Action<QuerySubscribed<T>>;

  queryUnsubscribed<T extends Fn>(
    payload: QueryUnsubscribed<T>
  ): Action<QueryUnsubscribed<T>>;

  queryStaled<T extends Fn>(payload: QueryStaled<T>): Action<QueryStaled<T>>;

  queryCollected<T extends Fn>(
    payload: QueryCollected<T>
  ): Action<QueryCollected<T>>;

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
