import {
  MutationOptions,
  QueryOptions,
  ResourceActionTypes,
  VolatileQueryOptions,
} from './resource-actions';
import { Component, createStore, Store, tx, typeOf } from '../store';
import { schedulerComponent } from './scheduler';
import { getQuery } from './get-query';

const defaultVolatileQueryOptions: QueryOptions = {
  cacheTime: 10 * 60 * 1000, // 10 minutes
  staleTime: Infinity,
};

const defaultQueryOptions: QueryOptions = {
  cacheTime: 10 * 60 * 1000, // 10 minutes
  staleTime: Infinity,
};

interface QuerySubscriber {
  subscriberKey: string;
  options: QueryOptions;
}

interface QueryStateBase {
  queryHash: string;
  queryKey: string;
  queryArgs: any[];
  // queryOptions: QueryOptions;
  subscribers: QuerySubscriber[];
  state: 'active' | 'inactive';
  volatileQueryOptions: VolatileQueryOptions;
}

interface QueryStateInitial extends QueryStateBase {
  status: 'initial';
  data: undefined;
  error: undefined;
  dataTimestamp: undefined;
  errorTimestamp: undefined;
  staleTimestamp: undefined;
  cacheTimestamp: undefined;
}

interface QueryStateInitialData<T = unknown> extends QueryStateBase {
  status: 'initial-data';
  data: T;
  error: undefined;
  dataTimestamp: undefined;
  errorTimestamp: undefined;
  staleTimestamp: undefined;
  cacheTimestamp: undefined;
}

interface QueryStateQueryData<T = unknown> extends QueryStateBase {
  status: 'query-data';
  data: T;
  error: unknown | undefined;
  dataTimestamp: number;
  errorTimestamp: number | undefined;
  staleTimestamp: number;
  cacheTimestamp: number;
}

interface QueryStateQueryError<T> extends QueryStateBase {
  status: 'query-error';
  data: T | undefined;
  error: unknown;
  dataTimestamp: number | undefined;
  errorTimestamp: number;
  staleTimestamp: number;
  cacheTimestamp: number;
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
  mutationOptions: MutationOptions;
  state: 'active' | 'inactive';
  staleTimestamp: number | undefined;
  cacheTimestamp: number | undefined;
}

interface MutationStateInitial extends MutationStateBase {
  status: 'initial';
  mutationArgs: undefined;
  data: undefined;
  error: undefined;
  lastResultTimestamp: undefined;
}

interface MutationStateMutationData<T> extends MutationStateBase {
  status: 'mutation-data';
  mutationArgs: any[];
  data: T;
  error: undefined;
  lastResultTimestamp: number;
}

interface MutationStateMutationError extends MutationStateBase {
  status: 'mutation-error';
  mutationArgs: any[];
  data: undefined;
  error: unknown;
  lastResultTimestamp: number;
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

function getResultTimestamp(queryState: QueryState): undefined | number {
  if (
    queryState.dataTimestamp === undefined &&
    queryState.errorTimestamp === undefined
  ) {
    return undefined;
  }
  return Math.max(
    queryState.dataTimestamp ?? 0,
    queryState.errorTimestamp ?? 0
  );
}

function getStaleTime(queryState: QueryState) {
  return queryState.subscribers.reduce(
    (result, subscriber) => Math.min(result, subscriber.options.staleTime),
    Infinity
  );
}

function getStaleTimestamp(queryState: QueryState): undefined | number {
  const resultTimestamp = getResultTimestamp(queryState);

  if (resultTimestamp === undefined) {
    return undefined;
  }

  const staleTime = getStaleTime(queryState);
  const staleTimestamp = resultTimestamp + staleTime;

  return staleTimestamp;
}

function getCacheTime(
  queryState: QueryState,
  minCacheTime = queryState.volatileQueryOptions.cacheTime
) {
  return queryState.subscribers.reduce(
    (result, subscriber) => Math.max(result, subscriber.options.cacheTime),
    minCacheTime
  );
}

function getCacheTimestamp(queryState: QueryState) {
  const resultTimestamp = getResultTimestamp(queryState);

  if (resultTimestamp === undefined) {
    return undefined;
  }

  const cacheTime = getCacheTime(queryState);
  const cacheTimestamp = resultTimestamp + cacheTime;

  return Math.max(queryState.cacheTimestamp ?? 0, cacheTimestamp);
}

export function createResourceStore(
  namespace: string,
  actions: ResourceActionTypes
): Component<Store<ResourceState>> {
  return createStore({
    namespace,
    state: typeOf<ResourceState>({
      queries: {},
      mutations: {},
    }),
    deps: {
      scheduler: schedulerComponent,
    },
  })({
    runQuery: tx([actions.forceQuery], (state, action) => {
      const { queryKey, queryArgs, queryOptions } = action.payload;
      const { queryHash, queryState } = getQuery(
        state,
        queryKey,
        queryArgs,
        false
      );
      const runQueryOptions = {
        ...defaultQueryOptions,
        ...queryOptions,
      };
      if (queryState !== undefined) {
        queryState.volatileQueryOptions.cacheTime = Math.max(
          queryState.volatileQueryOptions.cacheTime,
          runQueryOptions.cacheTime
        );
      } else {
        state.queries[queryHash] = {
          queryHash,
          queryKey,
          queryArgs,
          state: 'inactive',
          status: 'initial',
          data: undefined,
          error: undefined,
          dataTimestamp: undefined,
          errorTimestamp: undefined,
          subscribers: [],
          staleTimestamp: undefined,
          cacheTimestamp: undefined,
          volatileQueryOptions: {
            cacheTime: runQueryOptions.cacheTime,
          },
        };
      }
    }),
    subscribeQuery: tx([actions.subscribeQuery], (state, action) => {
      const { queryKey, queryArgs, queryOptions, subscriberKey } =
        action.payload;
      const { queryHash, queryState } = getQuery(
        state,
        queryKey,
        queryArgs,
        false
      );
      const subscriberQueryOptions = {
        ...defaultQueryOptions,
        ...queryOptions,
      };
      if (queryState !== undefined) {
        queryState.subscribers.push({
          subscriberKey: action.payload.subscriberKey,
          options: subscriberQueryOptions,
        });
        queryState.staleTimestamp = getStaleTimestamp(queryState);
        queryState.cacheTimestamp = getCacheTimestamp(queryState);
        queryState.volatileQueryOptions.cacheTime = Math.max(
          queryState.volatileQueryOptions.cacheTime,
          subscriberQueryOptions.cacheTime
        );
      } else {
        state.queries[queryHash] = {
          queryHash,
          queryKey,
          queryArgs,
          state: 'inactive',
          status: 'initial',
          data: undefined,
          error: undefined,
          dataTimestamp: undefined,
          errorTimestamp: undefined,
          subscribers: [
            {
              subscriberKey,
              options: subscriberQueryOptions,
            },
          ],
          staleTimestamp: undefined,
          cacheTimestamp: undefined,
          volatileQueryOptions: {
            cacheTime: subscriberQueryOptions.cacheTime,
          },
        };
      }
    }),
    unsubscribeQuery: tx([actions.unsubscribeQuery], (state, action) => {
      const { queryKey, queryArgs, subscriberKey } = action.payload;
      const { queryState } = getQuery(state, queryKey, queryArgs);
      const subscriberIndex = queryState.subscribers.findIndex(
        (subscriber) => subscriber.subscriberKey === subscriberKey
      );
      if (subscriberIndex === -1) {
        throw new Error('no subscriber');
      }
      queryState.subscribers.splice(subscriberIndex, 1);
      queryState.staleTimestamp = getStaleTimestamp(queryState);
    }),
    startQuery: tx([actions.startQuery], (state, action) => {
      const { queryKey, queryArgs } = action.payload;
      const { queryState } = getQuery(state, queryKey, queryArgs);
      queryState.state = 'active';
    }),
    completeQuery: tx(
      [actions.completeQuery],
      (state, action, { scheduler }) => {
        const now = scheduler.now();
        const { queryKey, queryArgs, queryResult } = action.payload;
        const { queryState } = getQuery(state, queryKey, queryArgs);
        queryState.state = 'inactive';
        if (queryResult.status === 'success') {
          queryState.status = 'query-data';
          queryState.data = queryResult.data;
          queryState.dataTimestamp = now;
        } else {
          queryState.status = 'query-error';
          queryState.error = queryResult.error;
          queryState.errorTimestamp = now;
        }
        queryState.staleTimestamp = getStaleTimestamp(queryState);
        queryState.cacheTimestamp = getCacheTimestamp(queryState);
        queryState.volatileQueryOptions = {
          cacheTime: getCacheTime(queryState, 0),
        };
      }
    ),
    cancelQuery: tx([actions.cancelQuery], (state, action) => {
      const { queryKey, queryArgs } = action.payload;
      const { queryState } = getQuery(state, queryKey, queryArgs);
      queryState.state = 'inactive';
    }),
    cleanupQuery: tx([actions.cleanupQuery], (state, action) => {
      const { queryKey, queryArgs } = action.payload;
      const { queryHash } = getQuery(state, queryKey, queryArgs);
      delete state.queries[queryHash];
    }),
    invalidateQuery: tx(
      [actions.invalidateQuery],
      (state, action, { scheduler }) => {
        const { queryKey, queryArgs } = action.payload;
        const { queryState } = getQuery(state, queryKey, queryArgs, false);
        if (queryState !== undefined) {
          queryState.staleTimestamp = scheduler.now();
        }
      }
    ),
  });
}
