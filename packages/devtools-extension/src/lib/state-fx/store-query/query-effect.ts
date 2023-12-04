import { createDeps, createEffect, Deps } from '../store';
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
import { getCacheTimestamp, QueryState } from './resource-store';
import { Result } from './result';
import { is } from '../store/is';
import { ResourceActionTypes } from './resource-actions';
import { Fn } from './fn';
import { QueriesDef, QueryDef } from './queries';

export function createQueryEffect<TDeps>(
  namespace: string,
  queries: QueriesDef<{ [key: string]: Fn }, TDeps>,
  resourceActions: ResourceActionTypes,
  deps: Deps<TDeps>
) {
  return createEffect({
    namespace,
    deps: {
      scheduler: schedulerComponent,
      deps: createDeps(deps),
    },
  })({
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
          })
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
