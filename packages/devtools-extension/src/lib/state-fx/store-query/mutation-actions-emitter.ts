import { createEffect, Store, StoreComponent } from '../store';
import { getMutation } from './get-mutation';
import { getMutationHash } from './get-mutation-hash';
import { ResourceState } from './resource-store';
import { ResourceActionTypes } from './resource-actions';
import { ResourceKey } from './resource-key';
import { Result } from './result';
import { mapAction } from './map-action';

export function createMutationActionsEmitter(
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
    emitMutationSubscribed: mapAction(
      resourceActions.subscribeMutation,
      resourceActions.mutationSubscribed,
      mapMutationActionPayloadWithSubscriber
    ),
    emitMutationUnsubscribed: mapAction(
      resourceActions.unsubscribeMutation,
      resourceActions.mutationUnsubscribed,
      mapMutationActionPayloadWithSubscriber
    ),
    emitMutationRequested: mapAction(
      resourceActions.mutate,
      resourceActions.mutationRequested,
      mapMutationActionPayloadWithArgs
    ),
    emitMutationStarted: mapAction(
      resourceActions.startMutation,
      resourceActions.mutationStarted,
      mapMutationActionPayloadWithArgs
    ),
    emitMutationCancelled: mapAction(
      resourceActions.cancelMutation,
      resourceActions.mutationCancelled,
      mapMutationActionPayload
    ),
    emitMutationCompleted: mapAction(
      resourceActions.completeMutation,
      resourceActions.mutationCompleted,
      mapMutationActionPayloadWithResult
    ),
    emitMutationCollected: mapAction(
      resourceActions.collectMutation,
      resourceActions.mutationCollected,
      mapMutationActionPayloadWithoutState
    ),
  });
}

function mapMutationActionPayload(
  { mutatorKey, mutationKey }: { mutatorKey: string; mutationKey: ResourceKey },
  { store }: { store: Store<ResourceState> }
) {
  return {
    mutatorKey,
    mutationKey,
    ...getMutation(store.getState(), mutationKey, mutatorKey),
  };
}

function mapMutationActionPayloadWithArgs(
  {
    mutatorKey,
    mutationKey,
    mutationArgs,
  }: { mutatorKey: string; mutationKey: ResourceKey; mutationArgs: any[] },
  { store }: { store: Store<ResourceState> }
) {
  return {
    mutatorKey,
    mutationKey,
    mutationArgs,
    ...getMutation(store.getState(), mutationKey, mutatorKey),
  };
}

function mapMutationActionPayloadWithoutState({
  mutatorKey,
  mutationKey,
}: {
  mutatorKey: string;
  mutationKey: ResourceKey;
}) {
  return {
    mutatorKey,
    mutationKey,
    mutationHash: getMutationHash(mutationKey, mutatorKey),
  };
}

function mapMutationActionPayloadWithSubscriber(
  { mutationKey, mutatorKey }: { mutatorKey: string; mutationKey: ResourceKey },
  { store }: { store: Store<ResourceState> }
) {
  return {
    mutationKey,
    mutatorKey,
    ...getMutation(store.getState(), mutationKey, mutatorKey),
  };
}

function mapMutationActionPayloadWithResult(
  {
    mutatorKey,
    mutationKey,
    mutationArgs,
    mutationResult,
  }: {
    mutatorKey: string;
    mutationKey: ResourceKey;
    mutationArgs: any[];
    mutationResult: Result;
  },
  { store }: { store: Store<ResourceState> }
) {
  return {
    mutatorKey,
    mutationKey,
    mutationArgs,
    mutationResult,
    ...getMutation(store.getState(), mutationKey, mutatorKey),
  };
}
