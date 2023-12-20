import { createResourceKeys, ResourceKey } from './resource-key';
import { createResourceStore, QueryState } from './resource-store';
import { createResourceActions } from './resource-actions';
import {
  createResourceInitializerComponent,
  ResourceInitializerDef,
} from './resource-effect';
import {
  map,
  merge,
  Observable,
  of,
  Subject,
  VirtualTimeScheduler,
} from 'rxjs';
import {
  Action,
  actionsComponent,
  ActionType,
  createActions,
  createContainer,
} from '../store';
import { schedulerComponent } from './scheduler';
import { Fn } from './fn';
import { getQueryHash } from './get-query-hash';
import { Result } from './result';
import { Base, Diff } from './test-utils';

const TEN_MINUTES = 10 * 60 * 1000;

type TestQueries = {
  getTest(id: number): string;
};

type TestMutations = {};

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
  const { query: testQueryKeys } = createResourceKeys<
    TestQueries,
    TestMutations
  >();
  const testActions = createResourceActions('test');
  const testStore = createResourceStore('test', testActions);

  const results: Record<number, Subject<string>> = {};
  const testResourceInitializer = createResourceInitializerComponent(
    testStore,
    (): ResourceInitializerDef<TestQueries, {}> => ({
      name: 'test',
      actions: testActions,
      queries: {
        getTest: {
          queryFn: ([id]) => (results[id] = new Subject<string>()),
          dispatch: opts?.dispatch,
        },
      },
      mutations: {},
    })
  );

  const actions = container.use(actionsComponent).component;
  const listing: unknown[] = [];
  const listen: ActionType<any>[] = [
    testActions.queryPrefetchRequested,
    testActions.queryFetchRequested,
    testActions.querySubscribed,
    testActions.queryUnsubscribed,
    testActions.queryCollected,
    testActions.queryInvalidationRequested,
    testActions.queryStarted,
    testActions.queryCompleted,
    testActions.queryCancelled,
    ...(opts?.listen ?? []),
  ];
  merge(...listen.map(actions.ofType, actions)).subscribe((action) => {
    listing.push([scheduler.now(), action]);
  });

  container.use(testResourceInitializer);

  return {
    actions,
    listing,
    testQueryKeys,
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

function createQueryStateDiff<T extends Fn>(
  queryKey: ResourceKey<T>,
  queryArgs: Parameters<T>
) {
  return new Diff<QueryState<ReturnType<T>>>({
    status: 'initial',
    state: 'idle',
    queryKey,
    queryArgs,
    queryHash: getQueryHash(queryKey, queryArgs),
    data: undefined,
    error: undefined,
    dataTimestamp: undefined,
    errorTimestamp: undefined,
    subscriberKeys: [],
  });
}

function createQueryPayloadBase<T extends Fn>(
  queryKey: ResourceKey<T>,
  queryArgs: Parameters<T>
) {
  return new Base<{
    queryKey: ResourceKey<T>;
    queryArgs: Parameters<T>;
    queryHash: string;
  }>({
    queryKey,
    queryArgs,
    queryHash: getQueryHash(queryKey, queryArgs),
  });
}

function createQueryHarness<T extends Fn>(
  queryKey: ResourceKey<T>,
  queryArgs: Parameters<T>
): {
  queryPayload(): {
    queryKey: ResourceKey<T>;
    queryArgs: Parameters<T>;
    queryHash: string;
  };
  queryPayload<U>(patch: U): {
    queryKey: ResourceKey<T>;
    queryArgs: Parameters<T>;
    queryHash: string;
  } & U;
  queryState(): QueryState<ReturnType<T>>;
  queryState(
    patch: Partial<QueryState<ReturnType<T>>>
  ): QueryState<ReturnType<T>>;
} {
  const queryPayloadBase = createQueryPayloadBase(queryKey, queryArgs);
  const queryStateDiff = createQueryStateDiff(queryKey, queryArgs);

  return {
    queryPayload(patch?: any): any {
      return queryPayloadBase.get(patch);
    },
    queryState(patch?: any): any {
      return queryStateDiff.get(patch);
    },
  };
}

describe('Query', () => {
  describe('scenarios', () => {
    it('query is subscribed by the first subscriber', () => {
      const {
        actions,
        listing,
        testQueryKeys,
        testActions,
        resolveData,
        proceed,
      } = createTestHarness();

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      const { queryPayload, queryState } = createQueryHarness(
        testQueryKeys.getTest,
        [7]
      );

      expect(listing).toEqual([
        [
          0,
          testActions.querySubscribed(
            queryPayload({
              subscriberKey: 'subscriber',
              queryState: queryState({
                subscriberKeys: ['subscriber'],
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayload({
              queryState: queryState({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayload({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryState({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
      ]);
    });
    it('query is subscribed by the second subscriber after data resolves', () => {
      {
        // given
        const {
          actions,
          listing,
          testQueryKeys,
          testActions,
          resolveData,
          proceed,
        } = createTestHarness();

        actions.dispatch(
          testActions.subscribeQuery({
            subscriberKey: 'subscriber1',
            queryKey: testQueryKeys.getTest,
            queryArgs: [7],
          })
        );
        resolveData(7, 'foo');
        proceed();

        // when
        actions.dispatch(
          testActions.subscribeQuery({
            subscriberKey: 'subscriber2',
            queryKey: testQueryKeys.getTest,
            queryArgs: [7],
          })
        );

        // then
        const { queryPayload, queryState } = createQueryHarness(
          testQueryKeys.getTest,
          [7]
        );
        expect(listing).toEqual([
          [
            0,
            testActions.querySubscribed(
              queryPayload({
                subscriberKey: 'subscriber1',
                queryState: queryState({
                  subscriberKeys: ['subscriber1'],
                }),
              })
            ),
          ],
          [
            0,
            testActions.queryStarted(
              queryPayload({
                queryState: queryState({
                  state: 'fetching',
                }),
              })
            ),
          ],
          [
            0,
            testActions.queryCompleted(
              queryPayload({
                queryResult: {
                  status: 'success',
                  data: 'foo',
                },
                queryState: queryState({
                  state: 'idle',
                  status: 'query-data',
                  data: 'foo',
                  dataTimestamp: 0,
                }),
              })
            ),
          ],
          [
            0,
            testActions.querySubscribed(
              queryPayload({
                subscriberKey: 'subscriber2',
                queryState: queryState({
                  subscriberKeys: ['subscriber1', 'subscriber2'],
                }),
              })
            ),
          ],
        ]);
      }
    });
    it('query is subscribed by the second subscriber before the data resolves', () => {
      // given
      const {
        actions,
        listing,
        testQueryKeys,
        testActions,
        resolveData,
        proceed,
      } = createTestHarness();

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber1',
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );

      // when
      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber2',
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      // then
      const { queryPayload, queryState } = createQueryHarness(
        testQueryKeys.getTest,
        [7]
      );
      expect(listing).toEqual([
        [
          0,
          testActions.querySubscribed(
            queryPayload({
              subscriberKey: 'subscriber1',

              queryState: queryState({
                subscriberKeys: ['subscriber1'],
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayload({
              queryState: queryState({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.querySubscribed(
            queryPayload({
              subscriberKey: 'subscriber2',

              queryState: queryState({
                subscriberKeys: ['subscriber1', 'subscriber2'],
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayload({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryState({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
      ]);
    });
    it('query is unsubscribed after the data resolves', () => {
      const {
        actions,
        listing,
        testQueryKeys,
        testActions,
        resolveData,
        proceed,
      } = createTestHarness();

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      actions.dispatch(
        testActions.unsubscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      proceed();

      const { queryPayload, queryState } = createQueryHarness(
        testQueryKeys.getTest,
        [7]
      );

      expect(listing).toEqual([
        [
          0,
          testActions.querySubscribed(
            queryPayload({
              subscriberKey: 'subscriber',
              queryState: queryState({
                subscriberKeys: ['subscriber'],
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayload({
              queryState: queryState({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayload({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryState({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryUnsubscribed(
            queryPayload({
              subscriberKey: 'subscriber',
              queryState: queryState({
                subscriberKeys: [],
              }),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayload())],
      ]);
    });
    it('query is unsubscribed before the data resolves', () => {
      const {
        actions,
        listing,
        testQueryKeys,
        testActions,
        resolveData,
        proceed,
      } = createTestHarness();

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      actions.dispatch(
        testActions.unsubscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      const { queryPayload, queryState } = createQueryHarness(
        testQueryKeys.getTest,
        [7]
      );

      expect(listing).toEqual([
        [
          0,
          testActions.querySubscribed(
            queryPayload({
              subscriberKey: 'subscriber',
              queryState: queryState({
                subscriberKeys: ['subscriber'],
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayload({
              queryState: queryState({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryUnsubscribed(
            queryPayload({
              subscriberKey: 'subscriber',
              queryState: queryState({
                subscriberKeys: [],
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayload({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryState({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayload())],
      ]);
    });
    it('query is canceled', () => {
      const {
        actions,
        listing,
        testQueryKeys,
        testActions,
        resolveData,
        proceed,
      } = createTestHarness();

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      actions.dispatch(
        testActions.cancelQuery({
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      const { queryPayload, queryState } = createQueryHarness(
        testQueryKeys.getTest,
        [7]
      );

      expect(listing).toEqual([
        [
          0,
          testActions.querySubscribed(
            queryPayload({
              subscriberKey: 'subscriber',
              queryState: queryState({
                subscriberKeys: ['subscriber'],
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayload({
              queryState: queryState({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCancelled(
            queryPayload({
              queryState: queryState({
                state: 'idle',
              }),
            })
          ),
        ],
      ]);
    });
    it("query is prefetched when there's no data", () => {
      const {
        actions,
        listing,
        testQueryKeys,
        testActions,
        resolveData,
        proceed,
      } = createTestHarness();

      actions.dispatch(
        testActions.prefetchQuery({
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      const { queryPayload, queryState } = createQueryHarness(
        testQueryKeys.getTest,
        [7]
      );

      expect(listing).toEqual([
        [
          0,
          testActions.queryPrefetchRequested(
            queryPayload({
              queryState: queryState(),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayload({
              queryState: queryState({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayload({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryState({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayload({}))],
      ]);
    });
    it("query is prefetched when there's some data already", () => {
      const {
        actions,
        listing,
        testQueryKeys,
        testActions,
        resolveData,
        proceed,
      } = createTestHarness();

      actions.dispatch(
        testActions.prefetchQuery({
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      actions.dispatch(
        testActions.prefetchQuery({
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      proceed();

      const { queryPayload, queryState } = createQueryHarness(
        testQueryKeys.getTest,
        [7]
      );

      expect(listing).toEqual([
        [
          0,
          testActions.queryPrefetchRequested(
            queryPayload({
              queryState: queryState(),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayload({
              queryState: queryState({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayload({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryState({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryPrefetchRequested(
            queryPayload({
              queryState: queryState(),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayload({}))],
      ]);
    });
    it("query is fetched when there's no data", () => {
      const {
        actions,
        listing,
        testQueryKeys,
        testActions,
        resolveData,
        proceed,
      } = createTestHarness();

      actions.dispatch(
        testActions.fetchQuery({
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      const { queryPayload, queryState } = createQueryHarness(
        testQueryKeys.getTest,
        [7]
      );

      expect(listing).toEqual([
        [
          0,
          testActions.queryFetchRequested(
            queryPayload({
              queryState: queryState(),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayload({
              queryState: queryState({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayload({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryState({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayload({}))],
      ]);
    });
    it("query is fetched when there's some data already", () => {
      const {
        actions,
        listing,
        testQueryKeys,
        testActions,
        resolveData,
        proceed,
      } = createTestHarness();

      actions.dispatch(
        testActions.fetchQuery({
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      actions.dispatch(
        testActions.fetchQuery({
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'bar');
      proceed();

      const { queryPayload, queryState } = createQueryHarness(
        testQueryKeys.getTest,
        [7]
      );

      expect(listing).toEqual([
        [
          0,
          testActions.queryFetchRequested(
            queryPayload({
              queryState: queryState(),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayload({
              queryState: queryState({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayload({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryState({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryFetchRequested(
            queryPayload({
              queryState: queryState(),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayload({
              queryState: queryState({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayload({
              queryResult: {
                status: 'success',
                data: 'bar',
              },
              queryState: queryState({
                state: 'idle',
                status: 'query-data',
                data: 'bar',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayload({}))],
      ]);
    });
    it('query is invalidated when there are subscribers', () => {
      const {
        actions,
        listing,
        testQueryKeys,
        testActions,
        resolveData,
        proceed,
        clearListing,
      } = createTestHarness();

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      clearListing();
      actions.dispatch(
        testActions.invalidateQuery({
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'bar');
      proceed();

      const { queryPayload, queryState } = createQueryHarness(
        testQueryKeys.getTest,
        [7]
      );

      expect(listing).toEqual([
        [
          0,
          testActions.queryInvalidationRequested(
            queryPayload({
              queryState: queryState({
                data: 'foo',
                dataTimestamp: 0,
                status: 'query-data',
                subscriberKeys: ['subscriber'],
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayload({
              queryState: queryState({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayload({
              queryResult: {
                status: 'success',
                data: 'bar',
              },
              queryState: queryState({
                state: 'idle',
                status: 'query-data',
                data: 'bar',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
      ]);
    });
    it('query is invalidated when there are no subscribers', () => {
      const {
        actions,
        listing,
        testQueryKeys,
        testActions,
        resolveData,
        proceed,
        clearListing,
      } = createTestHarness();

      actions.dispatch(
        testActions.prefetchQuery({
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      clearListing();
      actions.dispatch(
        testActions.invalidateQuery({
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      proceed();

      const { queryPayload, queryState } = createQueryHarness(
        testQueryKeys.getTest,
        [7]
      );

      expect(listing).toEqual([
        [
          0,
          testActions.queryInvalidationRequested(
            queryPayload({
              queryState: queryState({
                data: 'foo',
                dataTimestamp: 0,
                status: 'query-data',
                subscriberKeys: [],
              }),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayload())],
      ]);
    });
    it('query with custom dispatch is started', () => {
      const debugActions = createActions<{
        started: { args: [number] };
        completed: { args: [number]; result: Result<string> };
      }>({ namespace: 'debug' });
      const {
        actions,
        listing,
        testQueryKeys,
        testActions,
        resolveData,
        proceed,
      } = createTestHarness({
        listen: [debugActions.started, debugActions.completed],
        dispatch(
          result: Observable<Result<string>>,
          args: [number]
        ): Observable<Action> {
          return merge(
            of(debugActions.started({ args })),
            result.pipe(
              map((result) => debugActions.completed({ args, result }))
            )
          );
        },
      });

      actions.dispatch(
        testActions.fetchQuery({
          queryKey: testQueryKeys.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      const { queryPayload, queryState } = createQueryHarness(
        testQueryKeys.getTest,
        [7]
      );

      expect(listing).toEqual([
        [
          0,
          testActions.queryFetchRequested(
            queryPayload({
              queryState: queryState(),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayload({
              queryState: queryState({
                state: 'fetching',
              }),
            })
          ),
        ],
        [0, debugActions.started({ args: [7] })],
        [
          0,
          testActions.queryCompleted(
            queryPayload({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryState({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
        [
          0,
          debugActions.completed({
            args: [7],
            result: { status: 'success', data: 'foo' },
          }),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayload())],
      ]);
    });
  });
});
