import { Fn } from './fn';
import {
  catchError,
  concat,
  connect,
  delay,
  distinctUntilChanged,
  EMPTY,
  exhaustMap,
  filter,
  groupBy,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';
import { Result } from './result';
import {
  Action,
  createEffect,
  Deps,
  Store,
  StoreComponent,
} from '@lib/state-fx/store';
import { CreateResourceKeysResult, ResourceKey } from './resource-key';
import { QueryOptions, ResourceActionTypes } from './resource-actions';
import { QueryState, ResourceState } from './resource-store';
import { getQueryHash } from './get-query-hash';
import { timeComponent } from './time';
import { getQuery } from './get-query';

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
    deps: { ...options.deps, __store: options.store, __time: timeComponent },
  })({
    emitQueryForced(actions, { __store: store }) {
      return actions.ofType(resourceActions.forceQuery).pipe(
        map(({ payload: { queryKey, queryArgs } }) =>
          resourceActions.queryForced({
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
    emitQueryCleanedUp(actions, { __store: store }) {
      return actions.ofType(resourceActions.cleanupQuery).pipe(
        map(({ payload: { queryKey, queryArgs } }) =>
          resourceActions.queryCleanedUp({
            queryKey,
            queryArgs,
            ...getQuery(store.getState(), queryKey, queryArgs),
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
    triggerQuery(actions, { __time: time }) {
      return merge(
        actions.ofType(resourceActions.queryForced),
        actions.ofType(resourceActions.querySubscribed),
        actions.ofType(resourceActions.queryUnsubscribed),
        actions.ofType(resourceActions.queryCompleted),
        actions.ofType(resourceActions.queryCancelled),
        actions.ofType(resourceActions.queryInvalidated)
      ).pipe(
        groupBy(({ payload: { queryHash } }) => queryHash),
        mergeMap(
          switchMap(({ payload: { queryKey, queryArgs, queryState } }) => {
            const now = time.now();
            if (
              queryState.subscribers.length !== 0 ||
              queryState.volatileQueryOptions !== undefined
            ) {
              const staleTimestamp = queryState.staleTimestamp ?? now;
              const staleDue = staleTimestamp - now;
              return staleDue !== Infinity
                ? of(
                    resourceActions.startQuery({
                      queryKey,
                      queryArgs,
                    })
                  ).pipe(delay(staleDue))
                : EMPTY;
            } else {
              const cacheTimestamp = queryState.cacheTimestamp ?? now;
              const cacheDue = cacheTimestamp - now;
              return concat(
                queryState.state === 'active'
                  ? of(resourceActions.cancelQuery({ queryKey, queryArgs }))
                  : EMPTY,
                cacheDue !== Infinity
                  ? of(
                      resourceActions.cleanupQuery({
                        queryKey,
                        queryArgs,
                      })
                    ).pipe(delay(cacheDue))
                  : EMPTY
              );
            }
          })
        )
      );
    },
    runQuery(actions, deps) {
      return merge(
        actions.ofType(resourceActions.queryStarted),
        actions.ofType(resourceActions.queryCancelled)
      ).pipe(
        groupBy(({ payload: { queryHash } }) => queryHash),
        mergeMap((groupedActions) =>
          groupedActions.pipe(
            filter(resourceActions.queryStarted.is),
            exhaustMap(({ payload: { queryKey, queryArgs, queryState } }) => {
              const query = queries[queryKey];
              if (query === undefined) {
                throw new Error('no query');
              }
              return query.query(queryArgs as any, deps as any).pipe(
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
                  groupedActions.pipe(filter(resourceActions.queryCancelled.is))
                )
              );
            })
          )
        )
      );
    },
  });
}
