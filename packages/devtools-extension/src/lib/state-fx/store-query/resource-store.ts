import {
  MutationOptions,
  QueryOptions,
  ResourceActionTypes,
} from './resource-actions';
import { Component } from '../store';
import { schedulerComponent } from './scheduler';
import { getQuery } from './get-query';
import { getMutation } from './get-mutation';
import { createStoreComponent, Store, StoreDef, tx } from '../store/store';

const defaultQueryOptions: QueryOptions = {
  cacheTime: 10 * 60 * 1000, // 10 minutes
  staleTime: 0,
};

const defaultMutationOptions: MutationOptions = {
  cacheTime: 10 * 60 * 1000, // 10 minutes
};

interface QuerySubscriber {
  subscriberKey: string;
}

/*
TODO:
- cacheTime should not be defined on subscribers
- staleTime is specific for a subscriber
- staleTime marks query as stale and does not start query automatically
- query starts when:
  - isStale & subscribeQuery is dispatched
  - isStale & runQuery is dispatched
  - invalidateQuery is dispatched


  subscribe
    if stale for new subscriber
      startQuery
  unsubscribe
    if last subscriber
      schedule cleanup
  fetchQuery // same as invalidate
    if force or stale for any subscriber
      startQuery
  prefetchQuery
    startQuery
    schedule cleanup
*/
interface QueryStateBase {
  queryHash: string;
  queryKey: string;
  queryArgs: any[];
  subscriberKeys: string[];
  state: 'idle' | 'fetching';
}

interface QueryStateInitial extends QueryStateBase {
  status: 'initial';
  data: undefined;
  error: undefined;
  dataTimestamp: undefined;
  errorTimestamp: undefined;
}

interface QueryStateInitialData<T = unknown> extends QueryStateBase {
  status: 'initial-data';
  data: T;
  error: undefined;
  dataTimestamp: undefined;
  errorTimestamp: undefined;
}

interface QueryStateQueryData<T = unknown> extends QueryStateBase {
  status: 'query-data';
  data: T;
  error: unknown | undefined;
  dataTimestamp: number;
  errorTimestamp: number | undefined;
}

interface QueryStateQueryError<T> extends QueryStateBase {
  status: 'query-error';
  data: T | undefined;
  error: unknown;
  dataTimestamp: number | undefined;
  errorTimestamp: number;
}

export type QueryState<T = unknown> =
  | QueryStateInitial
  | QueryStateInitialData<T>
  | QueryStateQueryData<T>
  | QueryStateQueryError<T>;

interface MutationStateBase {
  mutationHash: string;
  mutationKey: string;
  mutatorKey: string;
  subscriberKeys: string[];
  state: 'idle' | 'fetching';
}

interface MutationStateInitial extends MutationStateBase {
  status: 'initial';
  mutationArgs: undefined;
  data: undefined;
  error: undefined;
  dataTimestamp: undefined;
  errorTimestamp: undefined;
}

interface MutationStateMutationData<T> extends MutationStateBase {
  status: 'mutation-data';
  mutationArgs: any[];
  data: T;
  error: undefined;
  dataTimestamp: number;
  errorTimestamp: number | undefined;
}

interface MutationStateMutationError extends MutationStateBase {
  status: 'mutation-error';
  mutationArgs: any[];
  data: undefined;
  error: unknown;
  dataTimestamp: number | undefined;
  errorTimestamp: number;
}

export type MutationState<T = unknown> =
  | MutationStateInitial
  | MutationStateMutationData<T>
  | MutationStateMutationError;

export interface ResourceState {
  queries: Record<string, QueryState>;
  mutations: Record<string, MutationState>;
}

// function getQueryOptions(queryState: QueryState) {
//   const { minCacheTime } = queryState;
//   let staleTime = Infinity;
//   let cacheTime = 0;
//   for (const subscriber of queryState.subscribers) {
//     const { staleTime: subscriberStaleTime, cacheTime: subscriberCacheTime } =
//       subscriber.options;
//     staleTime = Math.min(staleTime, subscriberStaleTime);
//     cacheTime = Math.max(cacheTime, subscriberCacheTime, minCacheTime);
//   }
//   return queryState.queryOptions.staleTime === staleTime &&
//     queryState.queryOptions.cacheTime === cacheTime
//     ? queryState.queryOptions
//     : { staleTime, cacheTime };
// }

// function updateQueryOptions(
//   queryState:
//     | QueryStateInitial
//     | QueryStateInitialData<unknown>
//     | QueryStateQueryData<unknown>
//     | QueryStateQueryError
//     | QueryStateQueryErrorData<unknown>
// ) {
//   const queryOptions = queryState.queryOptions;
//   const updatedQueryOptions = getQueryOptions(queryState);
//   if (
//     queryOptions.staleTime !== updatedQueryOptions.staleTime ||
//     queryOptions.cacheTime !== updatedQueryOptions.cacheTime
//   ) {
//     queryState.queryOptions = updatedQueryOptions;
//   }
// }

// function getStaleTime(queryState: QueryState) {
//   const staleTime = queryState.subscribers.reduce(
//     (result, subscriber) => Math.min(result, subscriber.options.staleTime),
//     Infinity
//   );
//
//   return staleTime;
// }
//
// function getCacheTime(queryState: QueryState) {
//   const cacheTime = queryState.subscribers.reduce(
//     (result, subscriber) => Math.max(result, subscriber.options.cacheTime),
//     0
//   );
//
//   return Math.max(queryState.cacheTime, cacheTime);
// }

function getResultTimestamp(
  state: QueryState | MutationState
): undefined | number {
  if (state.dataTimestamp === undefined && state.errorTimestamp === undefined) {
    return undefined;
  }
  return Math.max(state.dataTimestamp ?? 0, state.errorTimestamp ?? 0);
}

// function getStaleTime(queryState: QueryState) {
//   return queryState.queryOptions.staleTime;
// }

export function getStaleTimestamp(queryState: QueryState): undefined | number {
  const resultTimestamp = getResultTimestamp(queryState);

  if (resultTimestamp === undefined) {
    return undefined;
  }

  return resultTimestamp + defaultQueryOptions.staleTime;
}

// function getCacheTime(queryState: QueryState) {
//   return queryState.queryOptions.cacheTime;
// }

export function getQueryCacheTimestamp(queryState: QueryState) {
  const resultTimestamp = getResultTimestamp(queryState);

  if (resultTimestamp === undefined) {
    return undefined;
  }

  return resultTimestamp + defaultQueryOptions.cacheTime;
}

export function getMutationCacheTimestamp(mutationState: MutationState) {
  const resultTimestamp = getResultTimestamp(mutationState);

  if (resultTimestamp === undefined) {
    return undefined;
  }

  return resultTimestamp + defaultMutationOptions.cacheTime;
}

export function createResourceStore(
  name: string,
  actions: ResourceActionTypes
): Component<Store<ResourceState>> {
  return createStoreComponent(
    ({ scheduler }): StoreDef<ResourceState> => ({
      name,
      state: {
        queries: {},
        mutations: {},
      },
      transitions: {
        subscribeQuery: tx([actions.subscribeQuery], (state, action) => {
          const { queryKey, queryArgs, subscriberKey } = action.payload;
          const { queryHash, queryState } = getQuery(
            state,
            queryKey,
            queryArgs,
            false
          );
          if (queryState !== undefined) {
            if (queryState.subscriberKeys.includes(subscriberKey)) {
              throw new Error('subscriber already exists');
            }
            queryState.subscriberKeys.push(subscriberKey);
          } else {
            state.queries[queryHash] = {
              queryHash,
              queryKey,
              queryArgs,
              state: 'idle',
              status: 'initial',
              data: undefined,
              error: undefined,
              dataTimestamp: undefined,
              errorTimestamp: undefined,
              subscriberKeys: [subscriberKey],
            };
          }
        }),
        unsubscribeQuery: tx([actions.unsubscribeQuery], (state, action) => {
          const { queryKey, queryArgs, subscriberKey } = action.payload;
          const { queryState } = getQuery(state, queryKey, queryArgs);
          const subscriberIndex =
            queryState.subscriberKeys.indexOf(subscriberKey);
          if (subscriberIndex === -1) {
            throw new Error('subscriber does not exist');
          }
          queryState.subscriberKeys.splice(subscriberIndex, 1);
        }),
        fetchQuery: tx(
          [actions.fetchQuery, actions.prefetchQuery],
          (state, action) => {
            const { queryKey, queryArgs } = action.payload;
            const { queryHash, queryState } = getQuery(
              state,
              queryKey,
              queryArgs,
              false
            );
            if (queryState === undefined) {
              state.queries[queryHash] = {
                queryHash,
                queryKey,
                queryArgs,
                state: 'idle',
                status: 'initial',
                data: undefined,
                error: undefined,
                dataTimestamp: undefined,
                errorTimestamp: undefined,
                subscriberKeys: [],
              };
            }
          }
        ),
        startQuery: tx([actions.startQuery], (state, action) => {
          const { queryKey, queryArgs } = action.payload;
          const { queryState } = getQuery(state, queryKey, queryArgs);
          queryState.state = 'fetching';
        }),
        completeQuery: tx([actions.completeQuery], (state, action) => {
          const now = scheduler.now();
          const { queryKey, queryArgs, queryResult } = action.payload;
          const { queryState } = getQuery(state, queryKey, queryArgs);
          queryState.state = 'idle';
          if (queryResult.status === 'success') {
            queryState.status = 'query-data';
            queryState.data = queryResult.data;
            queryState.dataTimestamp = now;
          } else {
            queryState.status = 'query-error';
            queryState.error = queryResult.error;
            queryState.errorTimestamp = now;
          }
        }),
        cancelQuery: tx([actions.cancelQuery], (state, action) => {
          const { queryKey, queryArgs } = action.payload;
          const { queryState } = getQuery(state, queryKey, queryArgs);
          queryState.state = 'idle';
        }),
        collectQuery: tx([actions.collectQuery], (state, action) => {
          const { queryKey, queryArgs } = action.payload;
          const { queryHash } = getQuery(state, queryKey, queryArgs);
          delete state.queries[queryHash];
        }),
        // TODO: invalidateQuery should remove inactive queries from cache?
        subscribeMutation: tx([actions.subscribeMutation], (state, action) => {
          const { mutationKey, mutatorKey, subscriberKey } = action.payload;
          const { mutationHash, mutationState } = getMutation(
            state,
            mutationKey,
            mutatorKey,
            false
          );
          if (mutationState !== undefined) {
            if (mutationState.subscriberKeys.includes(subscriberKey)) {
              throw new Error('subscriber already exists');
            }
            mutationState.subscriberKeys.push(subscriberKey);
          } else {
            state.mutations[mutationHash] = {
              mutationHash,
              mutationKey,
              mutatorKey,
              mutationArgs: undefined,
              state: 'idle',
              status: 'initial',
              data: undefined,
              error: undefined,
              dataTimestamp: undefined,
              errorTimestamp: undefined,
              subscriberKeys: [subscriberKey],
            };
          }
        }),
        unsubscribeMutation: tx(
          [actions.unsubscribeMutation],
          (state, action) => {
            const { mutationKey, mutatorKey, subscriberKey } = action.payload;
            const { mutationState } = getMutation(
              state,
              mutationKey,
              mutatorKey
            );
            const subscriberIndex =
              mutationState.subscriberKeys.indexOf(subscriberKey);
            if (subscriberIndex === -1) {
              throw new Error('subscriber does not exist');
            }
            mutationState.subscriberKeys.splice(subscriberIndex, 1);
          }
        ),
        mutate: tx([actions.mutate], (state, action) => {
          const { mutationKey, mutatorKey } = action.payload;
          const { mutationHash, mutationState } = getMutation(
            state,
            mutationKey,
            mutatorKey,
            false
          );
          if (mutationState === undefined) {
            state.mutations[mutationHash] = {
              mutationHash,
              mutationKey,
              mutatorKey,
              mutationArgs: undefined,
              state: 'idle',
              status: 'initial',
              data: undefined,
              error: undefined,
              dataTimestamp: undefined,
              errorTimestamp: undefined,
              subscriberKeys: [],
            };
          }
        }),
        startMutation: tx([actions.startMutation], (state, action) => {
          const { mutationKey, mutatorKey, mutationArgs } = action.payload;
          const { mutationState } = getMutation(state, mutationKey, mutatorKey);
          mutationState.state = 'fetching';
          mutationState.mutationArgs = mutationArgs;
        }),
        completeMutation: tx([actions.completeMutation], (state, action) => {
          const now = scheduler.now();
          const { mutationKey, mutatorKey, mutationResult } = action.payload;
          const { mutationState } = getMutation(state, mutationKey, mutatorKey);
          mutationState.state = 'idle';
          mutationState.mutationArgs = undefined;
          if (mutationResult.status === 'success') {
            mutationState.status = 'mutation-data';
            mutationState.data = mutationResult.data;
            mutationState.dataTimestamp = now;
          } else {
            mutationState.status = 'mutation-error';
            mutationState.error = mutationResult.error;
            mutationState.errorTimestamp = now;
          }
        }),
        cancelMutation: tx([actions.cancelMutation], (state, action) => {
          const { mutationKey, mutatorKey } = action.payload;
          const { mutationState } = getMutation(state, mutationKey, mutatorKey);
          mutationState.state = 'idle';
          mutationState.mutationArgs = undefined;
        }),
        collectMutation: tx([actions.collectMutation], (state, action) => {
          const { mutationKey, mutatorKey } = action.payload;
          const { mutationHash } = getMutation(state, mutationKey, mutatorKey);
          delete state.mutations[mutationHash];
        }),
      },
    }),
    {
      scheduler: schedulerComponent,
    }
  );
}
