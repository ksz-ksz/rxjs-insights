import { createDeps, createEffect, Deps, StoreComponent } from '../store';
import { schedulerComponent } from './scheduler';
import {
  catchError,
  connect,
  delay,
  EMPTY,
  exhaustMap,
  filter,
  groupBy,
  last,
  map,
  merge,
  mergeMap,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';
import {
  getQueryCacheTimestamp,
  QueryState,
  ResourceState,
} from './resource-store';
import { Result } from './result';
import { is } from '../store/is';
import { ResourceActionTypes } from './resource-actions';
import { Fn } from './fn';
import { QueriesDef, QueryDef } from './queries';
import { createQueryActionsEmitter } from './query-actions-emitter';

export function createQueryEffect<TDeps>(
  namespace: string,
  queries: QueriesDef<{ [key: string]: Fn }, TDeps>,
  resourceActions: ResourceActionTypes,
  resourceStore: StoreComponent<ResourceState>,
  deps: Deps<TDeps>
) {
  return createEffect({
    namespace,
    deps: {
      emitter: createQueryActionsEmitter(
        namespace,
        resourceActions,
        resourceStore
      ),
      scheduler: schedulerComponent,
      deps: createDeps(deps),
    },
  })({
    fetchQuery(actions) {
      return actions.ofType(resourceActions.queryFetchRequested).pipe(
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
      return actions.ofType(resourceActions.queryPrefetchRequested).pipe(
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
      return actions.ofType(resourceActions.queryInvalidationRequested).pipe(
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
    runQuery(actions, { deps }) {
      return merge(
        actions.ofType(resourceActions.queryStarted),
        actions.ofType(resourceActions.queryCancelled)
      ).pipe(
        groupBy(({ payload: { queryHash } }) => queryHash),
        mergeMap((queryActions) =>
          queryActions.pipe(
            filter(resourceActions.queryStarted.is),
            exhaustMap(({ payload: { queryKey, queryArgs, queryState } }) => {
              const query = getQueryDef(queries, queryKey);
              return query.queryFn(queryArgs, deps).pipe(
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
                    query.dispatch?.(result, queryArgs, deps) ?? EMPTY
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
    cleanupQuery(actions, { scheduler }) {
      return merge(
        actions.ofType(resourceActions.querySubscribed),
        actions.ofType(resourceActions.queryUnsubscribed),
        actions.ofType(resourceActions.queryStarted),
        actions.ofType(resourceActions.queryCompleted),
        actions.ofType(resourceActions.queryCancelled)
      ).pipe(
        groupBy(({ payload: { queryHash } }) => queryHash),
        mergeMap(
          switchMap(({ payload: { queryKey, queryArgs, queryState } }) => {
            if (
              queryState.subscriberKeys.length === 0 &&
              queryState.state !== 'fetching'
            ) {
              const now = scheduler.now();
              const cacheTimestamp = getQueryCacheTimestamp(queryState) ?? now;
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
          })
        )
      );
    },
  });
}

function hasSubscribers(queryState: QueryState) {
  return queryState.subscriberKeys.length !== 0;
}

function getQueryDef<TDeps>(
  queries: QueriesDef<{ [key: string]: Fn }, TDeps> | undefined,
  queryKey: string
): QueryDef<Fn, TDeps> {
  const queryDef = queries?.[queryKey];
  if (queryDef === undefined) {
    throw new Error(`no query def for '${queryKey}'`);
  }
  return queryDef;
}
