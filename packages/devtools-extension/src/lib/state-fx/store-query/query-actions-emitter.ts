import { createEffectComponent, Store, StoreComponent } from '../store';
import { getQuery } from './get-query';
import { getQueryHash } from './get-query-hash';
import { ResourceState } from './resource-store';
import { ResourceActionTypes } from './resource-actions';
import { ResourceKey } from './resource-key';
import { Result } from './result';
import { mapAction } from './map-action';

export function createQueryActionsEmitter(
  namespace: string,
  resourceActions: ResourceActionTypes,
  resourceStore: StoreComponent<ResourceState>
) {
  return createEffectComponent(
    (deps) => ({
      name: namespace,
      effects: {
        emitQuerySubscribed: mapAction(
          resourceActions.subscribeQuery,
          resourceActions.querySubscribed,
          mapQueryActionPayloadWithSubscriber,
          deps
        ),
        emitQueryUnsubscribed: mapAction(
          resourceActions.unsubscribeQuery,
          resourceActions.queryUnsubscribed,
          mapQueryActionPayloadWithSubscriber,
          deps
        ),
        emitQueryPrefetched: mapAction(
          resourceActions.prefetchQuery,
          resourceActions.queryPrefetchRequested,
          mapQueryActionPayload,
          deps
        ),
        emitQueryFetched: mapAction(
          resourceActions.fetchQuery,
          resourceActions.queryFetchRequested,
          mapQueryActionPayload,
          deps
        ),
        emitQueryInvalidated: mapAction(
          resourceActions.invalidateQuery,
          resourceActions.queryInvalidationRequested,
          mapQueryActionPayload,
          deps
        ),
        emitQueryStarted: mapAction(
          resourceActions.startQuery,
          resourceActions.queryStarted,
          mapQueryActionPayload,
          deps
        ),
        emitQueryCancelled: mapAction(
          resourceActions.cancelQuery,
          resourceActions.queryCancelled,
          mapQueryActionPayload,
          deps
        ),
        emitQueryCompleted: mapAction(
          resourceActions.completeQuery,
          resourceActions.queryCompleted,
          mapQueryActionPayloadWithResult,
          deps
        ),
        emitQueryCollected: mapAction(
          resourceActions.collectQuery,
          resourceActions.queryCollected,
          mapQueryActionPayloadWithoutState,
          deps
        ),
      },
    }),
    {
      store: resourceStore,
    }
  );
}

function mapQueryActionPayload(
  { queryKey, queryArgs }: { queryKey: ResourceKey; queryArgs: any[] },
  { store }: { store: Store<ResourceState> }
) {
  return {
    queryKey,
    queryArgs,
    ...getQuery(store.getState(), queryKey, queryArgs),
  };
}

function mapQueryActionPayloadWithoutState({
  queryKey,
  queryArgs,
}: {
  queryKey: ResourceKey;
  queryArgs: any[];
}) {
  return {
    queryKey,
    queryArgs,
    queryHash: getQueryHash(queryKey, queryArgs),
  };
}

function mapQueryActionPayloadWithSubscriber(
  {
    queryKey,
    queryArgs,
    subscriberKey,
  }: { queryKey: ResourceKey; queryArgs: any[]; subscriberKey: string },
  { store }: { store: Store<ResourceState> }
) {
  return {
    queryKey,
    queryArgs,
    subscriberKey,
    ...getQuery(store.getState(), queryKey, queryArgs),
  };
}

function mapQueryActionPayloadWithResult(
  {
    queryKey,
    queryArgs,
    queryResult,
  }: { queryKey: ResourceKey; queryArgs: any[]; queryResult: Result },
  { store }: { store: Store<ResourceState> }
) {
  return {
    queryKey,
    queryArgs,
    queryResult,
    ...getQuery(store.getState(), queryKey, queryArgs),
  };
}
