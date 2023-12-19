import { MutationDef, MutationsDef } from './mutations';
import { ResourceActionTypes } from './resource-actions';
import {
  createDeps,
  createEffectComponent,
  Deps,
  StoreComponent,
} from '@lib/state-fx/store';
import { getMutationCacheTimestamp, ResourceState } from './resource-store';
import { Fn } from './fn';
import { schedulerComponent } from './scheduler';
import {
  catchError,
  concatMap,
  connect,
  delay,
  EMPTY,
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
import { Result } from './result';
import { is } from '../store/is';
import { createMutationActionsEmitter } from './mutation-actions-emitter';

export function createMutationEffect<TDeps>(
  namespace: string,
  mutations: MutationsDef<{ [key: string]: Fn }, TDeps>,
  resourceActions: ResourceActionTypes,
  resourceStore: StoreComponent<ResourceState>,
  deps: Deps<TDeps>
) {
  return createEffectComponent(
    ({ scheduler, deps }) => ({
      name: namespace,
      effects: {
        mutate(actions) {
          return actions.ofType(resourceActions.mutationRequested).pipe(
            map(({ payload: { mutationKey, mutationArgs, mutatorKey } }) =>
              resourceActions.startMutation({
                mutationKey,
                mutationArgs,
                mutatorKey,
              })
            )
          );
        },
        runMutation(actions) {
          return merge(
            actions.ofType(resourceActions.mutationStarted),
            actions.ofType(resourceActions.mutationCancelled)
          ).pipe(
            groupBy(({ payload: { mutationHash } }) => mutationHash),
            mergeMap((mutationActions) =>
              mutationActions.pipe(
                filter(resourceActions.mutationStarted.is),
                concatMap(
                  ({
                    payload: {
                      mutatorKey,
                      mutationKey,
                      mutationArgs,
                      mutationState,
                    },
                  }) => {
                    const mutation = getMutationDef(mutations, mutationKey);
                    return mutation.mutateFn(mutationArgs, deps).pipe(
                      last(),
                      map((data): Result => ({ status: 'success', data })),
                      catchError((error) =>
                        of<Result>({ status: 'failure', error })
                      ),
                      connect((result) =>
                        merge(
                          result.pipe(
                            map((mutationResult) =>
                              resourceActions.completeMutation({
                                mutatorKey,
                                mutationKey,
                                mutationArgs,
                                mutationResult,
                              })
                            )
                          ),
                          mutation.dispatch?.(result, mutationArgs, deps) ??
                            EMPTY
                        )
                      ),
                      takeUntil(
                        mutationActions.pipe(
                          filter(is(resourceActions.mutationCancelled))
                        )
                      )
                    );
                  }
                )
              )
            )
          );
        },
        cleanupMutation(actions) {
          return merge(
            actions.ofType(resourceActions.mutationSubscribed),
            actions.ofType(resourceActions.mutationUnsubscribed),
            actions.ofType(resourceActions.mutationStarted),
            actions.ofType(resourceActions.mutationCompleted),
            actions.ofType(resourceActions.mutationCancelled)
          ).pipe(
            groupBy(({ payload: { mutationHash } }) => mutationHash),
            mergeMap(
              switchMap(
                ({ payload: { mutationKey, mutatorKey, mutationState } }) => {
                  if (
                    mutationState.mutatorKey === undefined &&
                    mutationState.state !== 'fetching'
                  ) {
                    const now = scheduler.now();
                    const cacheTimestamp =
                      getMutationCacheTimestamp(mutationState) ?? now;
                    const cacheDue = cacheTimestamp - now;
                    return cacheDue !== Infinity
                      ? of(
                          resourceActions.collectMutation({
                            mutationKey,
                            mutatorKey,
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
      },
    }),
    {
      emitter: createMutationActionsEmitter(
        namespace,
        resourceActions,
        resourceStore
      ),
      scheduler: schedulerComponent,
      deps: createDeps(deps),
    }
  );
}

function getMutationDef<TDeps>(
  mutations: MutationsDef<{ [key: string]: Fn }, TDeps> | undefined,
  mutationKey: string
): MutationDef<Fn, TDeps> {
  const mutationDef = mutations?.[mutationKey];
  if (mutationDef === undefined) {
    throw new Error(`no mutation def for '${mutationKey}'`);
  }
  return mutationDef;
}
