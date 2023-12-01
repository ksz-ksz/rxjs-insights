import { Fn } from './fn';
import {
  catchError,
  concat,
  connect,
  delay,
  EMPTY,
  exhaustMap,
  filter,
  first,
  groupBy,
  last,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';
import { Result } from './result';
import { Action, createEffect, Deps, StoreComponent } from '../store';
import { CreateResourceKeysResult } from './resource-key';
import { ResourceActionTypes } from './resource-actions';
import {
  getCacheTimestamp,
  getStaleTimestamp,
  QueryState,
  ResourceState,
} from './resource-store';
import { schedulerComponent } from './scheduler';
import { getQuery } from './get-query';
import { is } from '../store/is';
import { getQueryHash } from './get-query-hash';

interface QueryDef<TQuery extends Fn, TDeps> {
  query(args: Parameters<TQuery>, deps: TDeps): Observable<ReturnType<TQuery>>;

  dispatch?(
    result: Observable<Result<ReturnType<TQuery>>>,
    args: Parameters<TQuery>,
    deps: TDeps
  ): Observable<Action>;
}

type QueriesDef<TQueries extends { [key: string]: Fn }, TDeps> = {
  [K in keyof TQueries]: QueryDef<TQueries[K], TDeps>;
};

interface MutationDef<TMutation extends Fn, TDeps> {
  mutate(
    args: Parameters<TMutation>,
    deps: TDeps
  ): Observable<ReturnType<TMutation>>;

  dispatch?(
    result: Observable<Result<ReturnType<TMutation>>>,
    args: Parameters<TMutation>,
    deps: TDeps
  ): Observable<Action>;
}

type MutationsDef<TMutations extends { [key: string]: Fn }, TDeps> = {
  [K in keyof TMutations]: MutationDef<TMutations[K], TDeps>;
};

// function selectQueryOptions(
//   store: Store<ResourceState>,
//   queryKey: ResourceKey,
//   queryArgsHash: string
// ) {
//   return store.getStateObservable().pipe(
//     map(
//       (state) =>
//         state.queries.find(
//           (x) => x.queryKey === queryKey && x.queryArgsHash === queryArgsHash
//         )!
//     ),
//     distinctUntilChanged(),
//     map((queryState) => {
//       const queryOptions: QueryOptions = {
//         staleTime: Infinity,
//         cacheTime: 0,
//       };
//       for (const subscriber of queryState.subscribers) {
//         queryOptions.cacheTime = Math.max(
//           queryOptions.cacheTime!,
//           subscriber.options?.cacheTime ?? 0
//         );
//         queryOptions.staleTime = Math.min(
//           queryOptions.staleTime!,
//           subscriber.options?.staleTime ?? 0
//         );
//       }
//       return queryOptions;
//     })
//   );
// }

function isStale(queryState: QueryState) {
  if (
    queryState.dataTimestamp === undefined &&
    queryState.errorTimestamp === undefined
  ) {
    return true;
  }
}

function hasSubscribers(queryState: QueryState) {
  return queryState.subscriberKeys.length !== 0;
}

export function createResourceEffect<
  TQueries extends { [key: string]: Fn },
  TMutations extends { [key: string]: Fn },
  TDeps
>(
  options: {
    namespace: string;
    keys: CreateResourceKeysResult<TQueries, TMutations>;
    store: StoreComponent<ResourceState>;
    actions: ResourceActionTypes;
    deps?: Deps<TDeps>;
  },
  queries: QueriesDef<TQueries, TDeps>,
  mutations: MutationsDef<TMutations, TDeps>
) {
  const resourceActions = options.actions;
  return createEffect({
    namespace: options.namespace,
    deps: {
      ...options.deps,
      __store: options.store,
      __scheduler: schedulerComponent,
    },
  })({
    emitQueryPrefetched(actions, { __store: store }) {
      return actions.ofType(resourceActions.prefetchQuery).pipe(
        map(({ payload: { queryKey, queryArgs } }) =>
          resourceActions.queryPrefetched({
            queryKey,
            queryArgs,
            ...getQuery(store.getState(), queryKey, queryArgs),
          })
        )
      );
    },
    emitQueryFetched(actions, { __store: store }) {
      return actions.ofType(resourceActions.fetchQuery).pipe(
        map(({ payload: { queryKey, queryArgs } }) =>
          resourceActions.queryFetched({
            queryKey,
            queryArgs,
            ...getQuery(store.getState(), queryKey, queryArgs),
          })
        )
      );
    },
    emitQuerySubscribed(actions, { __store: store }) {
      return actions.ofType(resourceActions.subscribeQuery).pipe(
        map(({ payload: { queryKey, queryArgs, subscriberKey } }) =>
          resourceActions.querySubscribed({
            subscriberKey,
            queryKey,
            queryArgs,
            ...getQuery(store.getState(), queryKey, queryArgs),
          })
        )
      );
    },
    emitQueryUnsubscribed(actions, { __store: store }) {
      return actions.ofType(resourceActions.unsubscribeQuery).pipe(
        map(({ payload: { queryKey, queryArgs, subscriberKey } }) =>
          resourceActions.queryUnsubscribed({
            subscriberKey,
            queryKey,
            queryArgs,
            ...getQuery(store.getState(), queryKey, queryArgs),
          })
        )
      );
    },
    emitQueryStarted(actions, { __store: store }) {
      return actions.ofType(resourceActions.startQuery).pipe(
        map(({ payload: { queryKey, queryArgs } }) =>
          resourceActions.queryStarted({
            queryKey,
            queryArgs,
            ...getQuery(store.getState(), queryKey, queryArgs),
          })
        )
      );
    },
    emitQueryCompleted(actions, { __store: store }) {
      return actions.ofType(resourceActions.completeQuery).pipe(
        map(({ payload: { queryKey, queryArgs, queryResult } }) =>
          resourceActions.queryCompleted({
            queryKey,
            queryArgs,
            queryResult,
            ...getQuery(store.getState(), queryKey, queryArgs),
          })
        )
      );
    },
    emitQueryCancelled(actions, { __store: store }) {
      return actions.ofType(resourceActions.cancelQuery).pipe(
        map(({ payload: { queryKey, queryArgs } }) =>
          resourceActions.queryCancelled({
            queryKey,
            queryArgs,
            ...getQuery(store.getState(), queryKey, queryArgs),
          })
        )
      );
    },
    emitQueryStaled(actions, { __store: store }) {
      return actions.ofType(resourceActions.staleQuery).pipe(
        map(({ payload: { queryKey, queryArgs } }) =>
          resourceActions.queryStaled({
            queryKey,
            queryArgs,
            ...getQuery(store.getState(), queryKey, queryArgs),
          })
        )
      );
    },
    emitQueryCollected(actions, { __store: store }) {
      return actions.ofType(resourceActions.collectQuery).pipe(
        map(({ payload: { queryKey, queryArgs } }) =>
          resourceActions.queryCollected({
            queryKey,
            queryArgs,
            queryHash: getQueryHash(queryKey, queryArgs),
          })
        )
      );
    },
    emitQueryInvalidated(actions, { __store: store }) {
      return actions.ofType(resourceActions.invalidateQuery).pipe(
        map(({ payload: { queryKey, queryArgs } }) =>
          resourceActions.queryInvalidated({
            queryKey,
            queryArgs,
            ...getQuery(store.getState(), queryKey, queryArgs),
          })
        )
      );
    },
    cleanupQuery(actions, { __scheduler: scheduler }) {
      return merge(
        actions.ofType(resourceActions.querySubscribed),
        actions.ofType(resourceActions.queryUnsubscribed),
        actions.ofType(resourceActions.queryStarted),
        actions.ofType(resourceActions.queryCompleted),
        actions.ofType(resourceActions.queryCancelled)
      ).pipe(
        groupBy(({ payload: { queryHash } }) => queryHash),
        mergeMap(
          switchMap(
            ({ name, payload: { queryKey, queryArgs, queryState } }) => {
              if (
                queryState.subscriberKeys.length === 0 &&
                queryState.state !== 'fetching'
              ) {
                const now = scheduler.now();
                const cacheTimestamp = getCacheTimestamp(queryState) ?? now;
                const cacheDue = cacheTimestamp - now;
                return cacheDue !== Infinity
                  ? of(
                      resourceActions.collectQuery({
                        queryKey,
                        queryArgs,
                      })
                    ).pipe(delay(cacheDue, scheduler))
                  : EMPTY;
              } else {
                return EMPTY;
              }
            }
          )
        )
      );
    },
    fetchQuery(actions) {
      return actions.ofType(resourceActions.queryFetched).pipe(
        switchMap(({ payload: { queryKey, queryArgs, queryState } }) => {
          if (queryState.state !== 'fetching') {
            return of(
              resourceActions.startQuery({
                queryKey,
                queryArgs,
              })
            );
          } else {
            return EMPTY;
          }
        })
      );
    },
    prefetchQuery(actions) {
      return actions.ofType(resourceActions.queryPrefetched).pipe(
        switchMap(({ payload: { queryKey, queryArgs, queryState } }) => {
          // TODO: include initial-data?
          if (
            queryState.state !== 'fetching' &&
            queryState.status === 'initial'
          ) {
            return of(
              resourceActions.startQuery({
                queryKey,
                queryArgs,
              })
            );
          } else {
            return EMPTY;
          }
        })
      );
    },
    invalidateQuery(actions) {
      return actions.ofType(resourceActions.queryInvalidated).pipe(
        switchMap(({ payload: { queryKey, queryArgs, queryState } }) => {
          if (queryState.state !== 'fetching' && hasSubscribers(queryState)) {
            return of(
              resourceActions.startQuery({
                queryKey,
                queryArgs,
              })
            );
          } else {
            return EMPTY;
          }
        })
      );
    },
    subscribeQuery(actions) {
      return actions.ofType(resourceActions.querySubscribed).pipe(
        switchMap(({ payload: { queryKey, queryArgs, queryState } }) => {
          if (
            queryState.state !== 'fetching' &&
            queryState.status === 'initial'
          ) {
            return of(
              resourceActions.startQuery({
                queryKey,
                queryArgs,
              })
            );
          } else {
            return EMPTY;
          }
        })
      );
    },
    runQuery(actions, { __store, __scheduler, ...deps }) {
      return merge(
        actions.ofType(resourceActions.queryStarted),
        actions.ofType(resourceActions.queryCancelled)
      ).pipe(
        groupBy(({ payload: { queryHash } }) => queryHash),
        mergeMap((queryActions) =>
          queryActions.pipe(
            filter(resourceActions.queryStarted.is),
            exhaustMap(({ payload: { queryKey, queryArgs, queryState } }) => {
              const query = queries[queryKey];
              if (query === undefined) {
                throw new Error('no query');
              }
              return query.query(queryArgs as any, deps as any).pipe(
                last(),
                map((data): Result => ({ status: 'success', data })),
                catchError((error) => of<Result>({ status: 'failure', error })),
                connect((result) =>
                  merge(
                    result.pipe(
                      map((queryResult) =>
                        resourceActions.completeQuery({
                          queryKey,
                          queryArgs,
                          queryResult,
                        })
                      )
                    ),
                    query.dispatch?.(
                      result as any,
                      queryArgs as any,
                      deps as any
                    ) ?? EMPTY
                  )
                ),
                takeUntil(
                  queryActions.pipe(filter(is(resourceActions.queryCancelled)))
                )
              );
            })
          )
        )
      );
    },
  });
}
