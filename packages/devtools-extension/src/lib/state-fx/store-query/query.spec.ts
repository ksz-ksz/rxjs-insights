import { createResourceKeys, ResourceKey } from './resource-key';
import { createResourceStore, QueryState } from './resource-store';
import { createResourceActions } from './resource-actions';
import { createResourceEffect, queries } from './resource-effect';
import { merge, Subject, VirtualTimeScheduler } from 'rxjs';
import { actionsComponent, createContainer } from '../store';
import { schedulerComponent } from './scheduler';
import { Fn } from './fn';
import { getQueryHash } from './get-query-hash';

const TEN_MINUTES = 10 * 60 * 1000;

type TestQueries = {
  getTest(id: number): string;
};

type TestMutations = {};

function createTestHarness() {
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
  const testEffect = createResourceEffect(
    {
      namespace: 'test',
      actions: testActions,
      store: testStore,
    },
    {
      queries: queries(testQueryKeys, {
        getTest: {
          queryFn: ([id]) => (results[id] = new Subject<string>()),
        },
      }),
    }
  );

  const actions = container.use(actionsComponent).component;
  const listing: unknown[] = [];
  merge(
    actions.ofType(testActions.queryPrefetched),
    actions.ofType(testActions.queryFetched),
    actions.ofType(testActions.querySubscribed),
    actions.ofType(testActions.queryUnsubscribed),
    actions.ofType(testActions.queryStaled),
    actions.ofType(testActions.queryCollected),
    actions.ofType(testActions.queryInvalidated),
    actions.ofType(testActions.queryStarted),
    actions.ofType(testActions.queryCompleted),
    actions.ofType(testActions.queryCancelled)
  ).subscribe((action) => {
    listing.push([scheduler.now(), action]);
  });

  container.use(testEffect);

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
  queryState<U>(patch: U): QueryState<ReturnType<T>> & U;
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
          testActions.queryPrefetched(
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
          testActions.queryPrefetched(
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
          testActions.queryPrefetched(
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
          testActions.queryFetched(
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
          testActions.queryFetched(
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
          testActions.queryFetched(
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
          testActions.queryInvalidated(
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
          testActions.queryInvalidated(
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
  });
});

class Base<T> {
  constructor(private snapshot: T) {}

  get(): T;
  get<U>(change: U): T & U;
  get(change?: any): any {
    if (change !== undefined) {
      return patch(this.snapshot, change);
    }
    return this.snapshot;
  }
}

class Diff<T> {
  constructor(private snapshot: T) {}

  get(change?: Partial<T>) {
    if (change !== undefined) {
      this.snapshot = patch(this.snapshot, change);
    }
    return this.snapshot;
  }
}

function patch<T, U>(base: T, change: U): T & U {
  const result: any = { ...base };
  for (const key of Object.keys(change)) {
    // @ts-ignore
    const baseVal = base[key];
    // @ts-ignore
    const changeVal = change[key];
    if (
      typeof baseVal === 'object' &&
      baseVal !== null &&
      !Array.isArray(baseVal)
    ) {
      if (changeVal === undefined) {
        result[key] = undefined;
      } else {
        result[key] = patch(baseVal, changeVal);
      }
    } else {
      result[key] = changeVal;
    }
  }
  return result;
}
