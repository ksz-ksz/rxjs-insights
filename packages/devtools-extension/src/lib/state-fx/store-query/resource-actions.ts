import { ResourceKey } from './resource-key';
import { Fn } from './fn';
import { Action, ActionTypeFns, createActions } from '../store';
import { Result } from './result';
import { MutationState, QueryState } from './resource-store';

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
export type SubscribeMutation<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
};
export type UnsubscribeMutation<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
};
export type Mutate<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
};
export type MutationSubscribed<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationHash: string;
  mutationState: MutationState<ReturnType<T>>;
};
export type MutationUnsubscribed<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationHash: string;
  mutationState: MutationState<ReturnType<T>>;
};
export type MutationRequested<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
  mutationHash: string;
  mutationState: MutationState<ReturnType<T>>;
};
export type MutationStarted<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
  mutationHash: string;
  mutationState: MutationState<ReturnType<T>>;
};
export type MutationCompleted<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
  mutationHash: string;
  mutationResult: Result<ReturnType<T>>;
  mutationState: MutationState<ReturnType<T>>;
};
type MutationCancelled<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationHash: string;
  mutationState: MutationState<ReturnType<T>>;
};

type MutationCollected<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationHash: string;
};

type StartMutation<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
};

type CompleteMutation<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
  mutationResult: Result<ReturnType<T>>;
};

type CancelMutation<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
};

type CollectMutation<T extends Fn = Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
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
  // queries lifecycle
  queryPrefetchRequested<T extends Fn>(
    payload: QueryPrefetched<T>
  ): Action<QueryPrefetched<T>>;
  queryFetchRequested<T extends Fn>(
    payload: QueryFetched<T>
  ): Action<QueryFetched<T>>;

  querySubscribed<T extends Fn>(
    payload: QuerySubscribed<T>
  ): Action<QuerySubscribed<T>>;

  queryUnsubscribed<T extends Fn>(
    payload: QueryUnsubscribed<T>
  ): Action<QueryUnsubscribed<T>>;

  queryCollected<T extends Fn>(
    payload: QueryCollected<T>
  ): Action<QueryCollected<T>>;

  queryInvalidationRequested<T extends Fn>(
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
  mutationSubscribed<T extends Fn>(
    payload: MutationSubscribed<T>
  ): Action<MutationSubscribed<T>>;
  mutationUnsubscribed<T extends Fn>(
    payload: MutationUnsubscribed<T>
  ): Action<MutationUnsubscribed<T>>;
  mutationRequested<T extends Fn>(
    payload: MutationRequested<T>
  ): Action<MutationRequested<T>>;
  mutationStarted<T extends Fn>(
    payload: MutationStarted<T>
  ): Action<MutationStarted<T>>;
  mutationCompleted<T extends Fn>(
    payload: MutationCompleted<T>
  ): Action<MutationCompleted<T>>;
  mutationCancelled<T extends Fn>(
    payload: MutationCancelled<T>
  ): Action<MutationCancelled<T>>;
  mutationCollected<T extends Fn>(
    payload: MutationCollected<T>
  ): Action<MutationCollected<T>>;
  startMutation<T extends Fn>(
    payload: StartMutation<T>
  ): Action<StartMutation<T>>;
  completeMutation<T extends Fn>(
    payload: CompleteMutation<T>
  ): Action<CompleteMutation<T>>;
  cancelMutation<T extends Fn>(
    payload: CancelMutation<T>
  ): Action<CancelMutation<T>>;
  collectMutation<T extends Fn>(
    payload: CollectMutation<T>
  ): Action<CollectMutation<T>>;
}

export interface ResourceActionTypes extends ActionTypeFns<ResourceActions> {}

export function createResourceActions(namespace: string): ResourceActionTypes {
  return createActions({ namespace }) as any;
}
