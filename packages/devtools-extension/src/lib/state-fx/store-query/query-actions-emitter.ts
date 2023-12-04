import { createEffect, StoreComponent } from '../store';
import { map } from 'rxjs';
import { getQuery } from './get-query';
import { getQueryHash } from './get-query-hash';
import { ResourceState } from './resource-store';
import { ResourceActionTypes } from './resource-actions';

export function createQueryActionsEmitter(
  namespace: string,
  resourceActions: ResourceActionTypes,
  resourceStore: StoreComponent<ResourceState>
) {
  return createEffect({
    namespace,
    deps: {
      store: resourceStore,
    },
  })({
    emitQueryPrefetched(actions, { store }) {
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
    emitQueryFetched(actions, { store }) {
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
    emitQuerySubscribed(actions, { store }) {
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
    emitQueryUnsubscribed(actions, { store }) {
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
    emitQueryStarted(actions, { store }) {
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
    emitQueryCompleted(actions, { store }) {
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
    emitQueryCancelled(actions, { store }) {
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
    emitQueryStaled(actions, { store }) {
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
    emitQueryCollected(actions) {
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
    emitQueryInvalidated(actions, { store: store }) {
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
  });
}
