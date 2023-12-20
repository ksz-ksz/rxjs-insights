import { MutationDef, MutationsDef } from './mutations';
import { ResourceActionTypes } from './resource-actions';
import { Actions, createEffect } from '@lib/state-fx/store';
import { getMutationCacheTimestamp } from './resource-store';
import { Fn } from './fn';
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
  SchedulerLike,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs';
import { Result } from './result';
import { is } from '../store/is';

export function createMutationEffect(
  name: string,
  actions: Actions,
  scheduler: SchedulerLike,
  resourceActions: ResourceActionTypes,
  mutations: MutationsDef<{ [p: string]: Fn }>
) {
  return createEffect(actions, {
    name,
    effects: {
      runMutation(actions) {
        return merge(
          actions.ofType(resourceActions.mutationRequested),
          actions.ofType(resourceActions.mutationCancelled)
        ).pipe(
          groupBy(({ payload: { mutationHash } }) => mutationHash),
          mergeMap((mutationActions) =>
            mutationActions.pipe(
              filter(resourceActions.mutationRequested.is),
              concatMap(
                ({
                  name,
                  payload: {
                    mutatorKey,
                    mutationKey,
                    mutationArgs,
                    mutationState,
                  },
                }) => {
                  const mutation = getMutationDef(mutations, mutationKey);
                  return mutation.mutateFn(mutationArgs).pipe(
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
                        mutation.dispatch?.(result, mutationArgs) ?? EMPTY
                      )
                    ),
                    startWith(
                      resourceActions.startMutation({
                        mutatorKey,
                        mutationKey,
                        mutationArgs,
                      })
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
              ({
                name,
                payload: { mutationKey, mutatorKey, mutationState },
              }) => {
                if (
                  mutationState.subscriberKeys.length === 0 &&
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
  });
}

function getMutationDef(
  mutations: MutationsDef<{ [key: string]: Fn }> | undefined,
  mutationKey: string
): MutationDef<Fn> {
  const mutationDef = mutations?.[mutationKey];
  if (mutationDef === undefined) {
    throw new Error(`no mutation def for '${mutationKey}'`);
  }
  return mutationDef;
}
