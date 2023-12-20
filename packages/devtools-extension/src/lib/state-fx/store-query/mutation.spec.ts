import {
  Action,
  actionsComponent,
  ActionType,
  createContainer,
} from '@lib/state-fx/store';
import { merge, Observable, Subject, VirtualTimeScheduler } from 'rxjs';
import { Result } from './result';
import { schedulerComponent } from './scheduler';
import { createResourceKeys, ResourceKey } from './resource-key';
import { createResourceActions } from './resource-actions';
import { createResourceStore, MutationState } from './resource-store';
import { createResourceEffect } from './resource-effect';
import { mutations } from './mutations';
import { Fn } from './fn';
import { Base, Diff } from './test-utils';
import { getMutationHash } from './get-mutation-hash';

type TestMutations = {
  setTest(id: number): string;
};

function createTestHarness(opts?: {
  listen?: ActionType<any>[];
  dispatch?(
    result: Observable<Result<string>>,
    args: [number]
  ): Observable<Action>;
}) {
  const container = createContainer();
  const scheduler = new VirtualTimeScheduler();
  container.provide(schedulerComponent, {
    init() {
      return { component: scheduler };
    },
  });
  const { mutation: testMutationKeys } = createResourceKeys<
    {},
    TestMutations
  >();
  const testActions = createResourceActions('test');
  const testStore = createResourceStore('test', testActions);

  const results: Record<number, Subject<string>> = {};
  const testEffect = createResourceEffect(
    {
      namespace: 'test',
      actions: testActions,
      store: testStore,
    },
    {
      mutations: mutations(testMutationKeys, {
        setTest: {
          mutateFn: ([id]) => (results[id] = new Subject<string>()),
          dispatch: opts?.dispatch,
        },
      }),
    }
  );

  const actions = container.use(actionsComponent).component;
  const listing: unknown[] = [];
  const listen: ActionType<any>[] = [
    testActions.mutationRequested,
    testActions.mutationSubscribed,
    testActions.mutationUnsubscribed,
    testActions.mutationCollected,
    testActions.mutationStarted,
    testActions.mutationCompleted,
    testActions.mutationCancelled,
    ...(opts?.listen ?? []),
  ];
  merge(...listen.map(actions.ofType, actions)).subscribe((action) => {
    listing.push([scheduler.now(), action]);
  });

  container.use(testEffect);

  return {
    actions,
    listing,
    testMutationKeys,
    testActions,
    resolveData(id: number, value: string) {
      const result = results[id];
      result.next(value);
      result.complete();
    },
    resolveError(id: number, error: any) {
      const result = results[id];
      result.error(error);
    },
    proceedBy(frames: number) {
      scheduler.maxFrames = scheduler.frame + frames;
      scheduler.flush();
    },
    proceedTo(frame: number) {
      scheduler.maxFrames = frame;
      scheduler.flush();
    },
    proceed() {
      scheduler.maxFrames = Infinity;
      scheduler.flush();
    },
    clearListing() {
      listing.length = 0;
    },
  };
}

function createMutationStateDiff<T extends Fn>(
  mutationKey: ResourceKey<T>,
  mutatorKey: string
) {
  return new Diff<MutationState<ReturnType<T>>>({
    status: 'initial',
    state: 'idle',
    mutationKey,
    mutatorKey,
    mutationHash: getMutationHash(mutationKey, mutatorKey),
    mutationArgs: undefined,
    data: undefined,
    error: undefined,
    dataTimestamp: undefined,
    errorTimestamp: undefined,
    subscriberKeys: [],
  });
}

function createMutationPayloadBase<T extends Fn>(
  mutationKey: ResourceKey<T>,
  mutatorKey: string
) {
  return new Base<{
    mutationKey: ResourceKey<T>;
    mutatorKey: string;
    mutationHash: string;
  }>({
    mutationKey,
    mutatorKey,
    mutationHash: getMutationHash(mutationKey, mutatorKey),
  });
}

function createMutationHarness<T extends Fn>(
  mutationKey: ResourceKey<T>,
  mutatorKey: string
): {
  mutationPayload(): {
    mutationKey: ResourceKey<T>;
    mutatorKey: string;
    mutationHash: string;
  };
  mutationPayload<U>(patch: U): {
    mutationKey: ResourceKey<T>;
    mutatorKey: string;
    mutationHash: string;
  } & U;
  mutationState(): MutationState<ReturnType<T>>;
  mutationState(
    patch: Partial<MutationState<ReturnType<T>>>
  ): MutationState<ReturnType<T>>;
} {
  const mutationPayloadBase = createMutationPayloadBase(
    mutationKey,
    mutatorKey
  );
  const mutationStateDiff = createMutationStateDiff(mutationKey, mutatorKey);

  return {
    mutationPayload(patch?: any): any {
      return mutationPayloadBase.get(patch);
    },
    mutationState(patch?: any): any {
      return mutationStateDiff.get(patch);
    },
  };
}

const TEN_MINUTES = 600_000;
describe('Mutation', () => {
  it('mutates, resolves', () => {
    const {
      actions,
      testMutationKeys,
      testActions,
      listing,
      resolveData,
      proceed,
    } = createTestHarness();

    actions.dispatch(
      testActions.mutate({
        mutatorKey: 'mutator',
        mutationKey: testMutationKeys.setTest,
        mutationArgs: [7],
      })
    );

    const { mutationPayload, mutationState } = createMutationHarness(
      testMutationKeys.setTest,
      'mutator'
    );

    resolveData(7, 'done');
    proceed();
    expect(listing).toEqual([
      [
        0,
        testActions.mutationRequested(
          mutationPayload({
            mutationArgs: [7] as [number],
            mutationState: mutationState(),
          })
        ),
      ],
      [
        0,
        testActions.mutationStarted(
          mutationPayload({
            mutationArgs: [7] as [number],
            mutationState: mutationState({
              state: 'fetching',
              mutationArgs: [7],
            }),
          })
        ),
      ],
      [
        0,
        testActions.mutationCompleted(
          mutationPayload({
            mutationArgs: [7] as [number],
            mutationState: mutationState({
              state: 'idle',
              status: 'mutation-data',
              mutationArgs: undefined,
              data: 'done',
              dataTimestamp: 0,
            }),
            mutationResult: {
              status: 'success',
              data: 'done',
            },
          })
        ),
      ],
      [TEN_MINUTES, testActions.mutationCollected(mutationPayload())],
    ]);
  });

  it('subscribes, unsubscribes', () => {
    const { actions, testMutationKeys, testActions, listing, proceed } =
      createTestHarness();

    actions.dispatch(
      testActions.subscribeMutation({
        subscriberKey: 'subscriber',
        mutationKey: testMutationKeys.setTest,
        mutatorKey: 'mutator',
      })
    );

    actions.dispatch(
      testActions.unsubscribeMutation({
        subscriberKey: 'subscriber',
        mutationKey: testMutationKeys.setTest,
        mutatorKey: 'mutator',
      })
    );

    const { mutationPayload, mutationState } = createMutationHarness(
      testMutationKeys.setTest,
      'mutator'
    );

    proceed();
    expect(listing).toEqual([
      [
        0,
        testActions.mutationSubscribed(
          mutationPayload({
            subscriberKey: 'subscriber',
            mutationState: mutationState({
              subscriberKeys: ['subscriber'],
            }),
          })
        ),
      ],
      [
        0,
        testActions.mutationUnsubscribed(
          mutationPayload({
            subscriberKey: 'subscriber',
            mutationState: mutationState({
              subscriberKeys: [],
            }),
          })
        ),
      ],
      [0, testActions.mutationCollected(mutationPayload())],
    ]);
  });

  it('subscribes, mutates, unsubscribes, resolves', () => {
    const {
      actions,
      testMutationKeys,
      testActions,
      listing,
      resolveData,
      proceed,
    } = createTestHarness();

    actions.dispatch(
      testActions.subscribeMutation({
        subscriberKey: 'subscriber',
        mutationKey: testMutationKeys.setTest,
        mutatorKey: 'mutator',
      })
    );

    actions.dispatch(
      testActions.mutate({
        mutatorKey: 'mutator',
        mutationKey: testMutationKeys.setTest,
        mutationArgs: [7],
      })
    );

    actions.dispatch(
      testActions.unsubscribeMutation({
        subscriberKey: 'subscriber',
        mutationKey: testMutationKeys.setTest,
        mutatorKey: 'mutator',
      })
    );

    resolveData(7, 'done');

    const { mutationPayload, mutationState } = createMutationHarness(
      testMutationKeys.setTest,
      'mutator'
    );

    proceed();
    expect(listing).toEqual([
      [
        0,
        testActions.mutationSubscribed(
          mutationPayload({
            subscriberKey: 'subscriber',
            mutationState: mutationState({
              subscriberKeys: ['subscriber'],
            }),
          })
        ),
      ],
      [
        0,
        testActions.mutationRequested(
          mutationPayload({
            mutationArgs: [7] as [number],
            mutationState: mutationState(),
          })
        ),
      ],
      [
        0,
        testActions.mutationStarted(
          mutationPayload({
            mutationArgs: [7] as [number],
            mutationState: mutationState({
              state: 'fetching',
              mutationArgs: [7],
            }),
          })
        ),
      ],
      [
        0,
        testActions.mutationUnsubscribed(
          mutationPayload({
            subscriberKey: 'subscriber',
            mutationState: mutationState({
              subscriberKeys: [],
            }),
          })
        ),
      ],
      [
        0,
        testActions.mutationCompleted(
          mutationPayload({
            mutationArgs: [7] as [number],
            mutationState: mutationState({
              state: 'idle',
              status: 'mutation-data',
              mutationArgs: undefined,
              data: 'done',
              dataTimestamp: 0,
            }),
            mutationResult: {
              status: 'success',
              data: 'done',
            },
          })
        ),
      ],
      [TEN_MINUTES, testActions.mutationCollected(mutationPayload())],
    ]);
  });

  it('subscribes, mutates, resolves, unsubscribes', () => {
    const {
      actions,
      testMutationKeys,
      testActions,
      listing,
      resolveData,
      proceed,
    } = createTestHarness();

    actions.dispatch(
      testActions.subscribeMutation({
        subscriberKey: 'subscriber',
        mutationKey: testMutationKeys.setTest,
        mutatorKey: 'mutator',
      })
    );

    actions.dispatch(
      testActions.mutate({
        mutatorKey: 'mutator',
        mutationKey: testMutationKeys.setTest,
        mutationArgs: [7],
      })
    );

    resolveData(7, 'done');

    actions.dispatch(
      testActions.unsubscribeMutation({
        subscriberKey: 'subscriber',
        mutationKey: testMutationKeys.setTest,
        mutatorKey: 'mutator',
      })
    );

    const { mutationPayload, mutationState } = createMutationHarness(
      testMutationKeys.setTest,
      'mutator'
    );

    proceed();
    expect(listing).toEqual([
      [
        0,
        testActions.mutationSubscribed(
          mutationPayload({
            subscriberKey: 'subscriber',
            mutationState: mutationState({
              subscriberKeys: ['subscriber'],
            }),
          })
        ),
      ],
      [
        0,
        testActions.mutationRequested(
          mutationPayload({
            mutationArgs: [7] as [number],
            mutationState: mutationState(),
          })
        ),
      ],
      [
        0,
        testActions.mutationStarted(
          mutationPayload({
            mutationArgs: [7] as [number],
            mutationState: mutationState({
              state: 'fetching',
              mutationArgs: [7],
            }),
          })
        ),
      ],
      [
        0,
        testActions.mutationCompleted(
          mutationPayload({
            mutationArgs: [7] as [number],
            mutationState: mutationState({
              state: 'idle',
              status: 'mutation-data',
              mutationArgs: undefined,
              data: 'done',
              dataTimestamp: 0,
            }),
            mutationResult: {
              status: 'success',
              data: 'done',
            },
          })
        ),
      ],
      [
        0,
        testActions.mutationUnsubscribed(
          mutationPayload({
            subscriberKey: 'subscriber',
            mutationState: mutationState({
              subscriberKeys: [],
            }),
          })
        ),
      ],
      [TEN_MINUTES, testActions.mutationCollected(mutationPayload())],
    ]);
  });

  it('mutates(A), mutates(B), resolves(A), resolves(B)', () => {
    const {
      actions,
      testMutationKeys,
      testActions,
      listing,
      resolveData,
      proceed,
    } = createTestHarness();

    actions.dispatch(
      testActions.mutate({
        mutatorKey: 'mutator',
        mutationKey: testMutationKeys.setTest,
        mutationArgs: [7],
      })
    );

    actions.dispatch(
      testActions.mutate({
        mutatorKey: 'mutator',
        mutationKey: testMutationKeys.setTest,
        mutationArgs: [42],
      })
    );

    const { mutationPayload, mutationState } = createMutationHarness(
      testMutationKeys.setTest,
      'mutator'
    );

    resolveData(7, 'done(A)');
    resolveData(42, 'done(B)');
    proceed();
    expect(listing).toEqual([
      [
        0,
        testActions.mutationRequested(
          mutationPayload({
            mutationArgs: [7] as [number],
            mutationState: mutationState(),
          })
        ),
      ],
      [
        0,
        testActions.mutationStarted(
          mutationPayload({
            mutationArgs: [7] as [number],
            mutationState: mutationState({
              state: 'fetching',
              mutationArgs: [7],
            }),
          })
        ),
      ],
      [
        0,
        testActions.mutationRequested(
          mutationPayload({
            mutationArgs: [42] as [number],
            mutationState: mutationState(),
          })
        ),
      ],
      [
        0,
        testActions.mutationCompleted(
          mutationPayload({
            mutationArgs: [7] as [number],
            mutationState: mutationState({
              state: 'idle',
              status: 'mutation-data',
              mutationArgs: undefined,
              data: 'done(A)',
              dataTimestamp: 0,
            }),
            mutationResult: {
              status: 'success',
              data: 'done(A)',
            },
          })
        ),
      ],
      [
        0,
        testActions.mutationStarted(
          mutationPayload({
            mutationArgs: [42] as [number],
            mutationState: mutationState({
              state: 'fetching',
              mutationArgs: [42],
            }),
          })
        ),
      ],
      [
        0,
        testActions.mutationCompleted(
          mutationPayload({
            mutationArgs: [42] as [number],
            mutationState: mutationState({
              state: 'idle',
              status: 'mutation-data',
              mutationArgs: undefined,
              data: 'done(B)',
              dataTimestamp: 0,
            }),
            mutationResult: {
              status: 'success',
              data: 'done(B)',
            },
          })
        ),
      ],
      [TEN_MINUTES, testActions.mutationCollected(mutationPayload())],
    ]);
  });
});
