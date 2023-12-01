import { createResourceKeys, ResourceKey } from './resource-key';
import { createResourceStore, QueryState } from './resource-store';
import { createResourceActions } from './resource-actions';
import { createResourceEffect } from './resource-effect';
import { merge, Subject, VirtualTimeScheduler } from 'rxjs';
import { Action, actionsComponent, createContainer } from '../store';
import { schedulerComponent } from './scheduler';
import { Fn } from './fn';
import { getQueryHash } from './get-query-hash';

const TEN_MINUTES = 10 * 60 * 1000;

type TestQueries = {
  getTest(id: number): string;
};

type TestMutations = {};

function createTestHarness(timestamps = false) {
  const container = createContainer();
  const scheduler = new VirtualTimeScheduler();
  container.provide(schedulerComponent, {
    init() {
      return { component: scheduler };
    },
  });
  const testKeys = createResourceKeys<TestQueries, TestMutations>();
  const testActions = createResourceActions('test');
  const testStore = createResourceStore('test', testActions);

  const results: Record<number, Subject<string>> = {};
  const testEffect = createResourceEffect(
    {
      namespace: 'test',
      keys: testKeys,
      actions: testActions,
      store: testStore,
    },
    {
      getTest: {
        query([id]) {
          return (results[id] = new Subject<string>());
        },
      },
    },
    {}
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
    if (timestamps) {
      listing.push([scheduler.now(), action]);
    } else {
      listing.push(action);
    }
  });

  container.use(testEffect);

  return {
    actions,
    listing,
    testKeys,
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

describe('Query', () => {
  describe('scenarios', () => {
    it('query is subscribed by the first subscriber', () => {
      const { actions, listing, testKeys, testActions, resolveData, proceed } =
        createTestHarness();

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      const queryPayloadBase = createQueryPayloadBase(testKeys.query.getTest, [
        7,
      ]);
      const queryStateDiff = createQueryStateDiff(testKeys.query.getTest, [7]);

      expect(listing).toEqual([
        testActions.querySubscribed(
          queryPayloadBase.get({
            subscriberKey: 'subscriber',
            queryState: queryStateDiff.get({
              subscriberKeys: ['subscriber'],
            }),
          })
        ),
        testActions.queryStarted(
          queryPayloadBase.get({
            queryState: queryStateDiff.get({
              state: 'fetching',
            }),
          })
        ),
        testActions.queryCompleted(
          queryPayloadBase.get({
            queryResult: {
              status: 'success',
              data: 'foo',
            },
            queryState: queryStateDiff.get({
              state: 'idle',
              status: 'query-data',
              data: 'foo',
              dataTimestamp: 0,
            }),
          })
        ),
      ]);
    });
    it('query is subscribed by the second subscriber after data resolves', () => {
      {
        // given
        const {
          actions,
          listing,
          testKeys,
          testActions,
          resolveData,
          proceed,
        } = createTestHarness();

        actions.dispatch(
          testActions.subscribeQuery({
            subscriberKey: 'subscriber1',
            queryKey: testKeys.query.getTest,
            queryArgs: [7],
          })
        );
        resolveData(7, 'foo');
        proceed();

        // when
        actions.dispatch(
          testActions.subscribeQuery({
            subscriberKey: 'subscriber2',
            queryKey: testKeys.query.getTest,
            queryArgs: [7],
          })
        );

        // then
        const queryPayloadBase = createQueryPayloadBase(
          testKeys.query.getTest,
          [7]
        );
        const queryStateDiff = createQueryStateDiff(testKeys.query.getTest, [
          7,
        ]);
        expect(listing).toEqual([
          testActions.querySubscribed(
            queryPayloadBase.get({
              subscriberKey: 'subscriber1',
              queryState: queryStateDiff.get({
                subscriberKeys: ['subscriber1'],
              }),
            })
          ),
          testActions.queryStarted(
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
                state: 'fetching',
              }),
            })
          ),
          testActions.queryCompleted(
            queryPayloadBase.get({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryStateDiff.get({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
          testActions.querySubscribed(
            queryPayloadBase.get({
              subscriberKey: 'subscriber2',
              queryState: queryStateDiff.get({
                subscriberKeys: ['subscriber1', 'subscriber2'],
              }),
            })
          ),
        ]);
      }
    });
    it('query is subscribed by the second subscriber before the data resolves', () => {
      // given
      const { actions, listing, testKeys, testActions, resolveData, proceed } =
        createTestHarness();

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber1',
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );

      // when
      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber2',
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      // then
      const queryPayloadBase = createQueryPayloadBase(testKeys.query.getTest, [
        7,
      ]);
      const queryStateDiff = createQueryStateDiff(testKeys.query.getTest, [7]);
      expect(listing).toEqual([
        testActions.querySubscribed(
          queryPayloadBase.get({
            subscriberKey: 'subscriber1',

            queryState: queryStateDiff.get({
              subscriberKeys: ['subscriber1'],
            }),
          })
        ),
        testActions.queryStarted(
          queryPayloadBase.get({
            queryState: queryStateDiff.get({
              state: 'fetching',
            }),
          })
        ),
        testActions.querySubscribed(
          queryPayloadBase.get({
            subscriberKey: 'subscriber2',

            queryState: queryStateDiff.get({
              subscriberKeys: ['subscriber1', 'subscriber2'],
            }),
          })
        ),
        testActions.queryCompleted(
          queryPayloadBase.get({
            queryResult: {
              status: 'success',
              data: 'foo',
            },
            queryState: queryStateDiff.get({
              state: 'idle',
              status: 'query-data',
              data: 'foo',
              dataTimestamp: 0,
            }),
          })
        ),
      ]);
    });
    it('query is unsubscribed after the data resolves', () => {
      const { actions, listing, testKeys, testActions, resolveData, proceed } =
        createTestHarness(true);

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      actions.dispatch(
        testActions.unsubscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      proceed();

      const queryPayloadBase = createQueryPayloadBase(testKeys.query.getTest, [
        7,
      ]);
      const queryStateDiff = createQueryStateDiff(testKeys.query.getTest, [7]);

      expect(listing).toEqual([
        [
          0,
          testActions.querySubscribed(
            queryPayloadBase.get({
              subscriberKey: 'subscriber',
              queryState: queryStateDiff.get({
                subscriberKeys: ['subscriber'],
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayloadBase.get({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryStateDiff.get({
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
            queryPayloadBase.get({
              subscriberKey: 'subscriber',
              queryState: queryStateDiff.get({
                subscriberKeys: [],
              }),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayloadBase.get())],
      ]);
    });
    it('query is unsubscribed before the data resolves', () => {
      const { actions, listing, testKeys, testActions, resolveData, proceed } =
        createTestHarness(true);

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      actions.dispatch(
        testActions.unsubscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      const queryPayloadBase = createQueryPayloadBase(testKeys.query.getTest, [
        7,
      ]);
      const queryStateDiff = createQueryStateDiff(testKeys.query.getTest, [7]);

      expect(listing).toEqual([
        [
          0,
          testActions.querySubscribed(
            queryPayloadBase.get({
              subscriberKey: 'subscriber',
              queryState: queryStateDiff.get({
                subscriberKeys: ['subscriber'],
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryUnsubscribed(
            queryPayloadBase.get({
              subscriberKey: 'subscriber',
              queryState: queryStateDiff.get({
                subscriberKeys: [],
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayloadBase.get({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryStateDiff.get({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayloadBase.get())],
      ]);
    });
    it('query is canceled', () => {
      const { actions, listing, testKeys, testActions, resolveData, proceed } =
        createTestHarness(true);

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      actions.dispatch(
        testActions.cancelQuery({
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      const queryPayloadBase = createQueryPayloadBase(testKeys.query.getTest, [
        7,
      ]);
      const queryStateDiff = createQueryStateDiff(testKeys.query.getTest, [7]);

      expect(listing).toEqual([
        [
          0,
          testActions.querySubscribed(
            queryPayloadBase.get({
              subscriberKey: 'subscriber',
              queryState: queryStateDiff.get({
                subscriberKeys: ['subscriber'],
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCancelled(
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
                state: 'idle',
              }),
            })
          ),
        ],
      ]);
    });
    it("query is prefetched when there's no data", () => {
      const { actions, listing, testKeys, testActions, resolveData, proceed } =
        createTestHarness(true);

      actions.dispatch(
        testActions.prefetchQuery({
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      const queryPayloadBase = createQueryPayloadBase(testKeys.query.getTest, [
        7,
      ]);
      const queryStateDiff = createQueryStateDiff(testKeys.query.getTest, [7]);

      expect(listing).toEqual([
        [
          0,
          testActions.queryPrefetched(
            queryPayloadBase.get({
              queryState: queryStateDiff.get(),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayloadBase.get({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryStateDiff.get({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayloadBase.get({}))],
      ]);
    });
    it("query is prefetched when there's some data already", () => {
      const { actions, listing, testKeys, testActions, resolveData, proceed } =
        createTestHarness(true);

      actions.dispatch(
        testActions.prefetchQuery({
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      actions.dispatch(
        testActions.prefetchQuery({
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      proceed();

      const queryPayloadBase = createQueryPayloadBase(testKeys.query.getTest, [
        7,
      ]);
      const queryStateDiff = createQueryStateDiff(testKeys.query.getTest, [7]);

      expect(listing).toEqual([
        [
          0,
          testActions.queryPrefetched(
            queryPayloadBase.get({
              queryState: queryStateDiff.get(),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayloadBase.get({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryStateDiff.get({
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
            queryPayloadBase.get({
              queryState: queryStateDiff.get(),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayloadBase.get({}))],
      ]);
    });
    it("query is fetched when there's no data", () => {
      const { actions, listing, testKeys, testActions, resolveData, proceed } =
        createTestHarness(true);

      actions.dispatch(
        testActions.fetchQuery({
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      proceed();

      const queryPayloadBase = createQueryPayloadBase(testKeys.query.getTest, [
        7,
      ]);
      const queryStateDiff = createQueryStateDiff(testKeys.query.getTest, [7]);

      expect(listing).toEqual([
        [
          0,
          testActions.queryFetched(
            queryPayloadBase.get({
              queryState: queryStateDiff.get(),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayloadBase.get({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryStateDiff.get({
                state: 'idle',
                status: 'query-data',
                data: 'foo',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayloadBase.get({}))],
      ]);
    });
    it("query is fetched when there's some data already", () => {
      const { actions, listing, testKeys, testActions, resolveData, proceed } =
        createTestHarness(true);

      actions.dispatch(
        testActions.fetchQuery({
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      actions.dispatch(
        testActions.fetchQuery({
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'bar');
      proceed();

      const queryPayloadBase = createQueryPayloadBase(testKeys.query.getTest, [
        7,
      ]);
      const queryStateDiff = createQueryStateDiff(testKeys.query.getTest, [7]);

      expect(listing).toEqual([
        [
          0,
          testActions.queryFetched(
            queryPayloadBase.get({
              queryState: queryStateDiff.get(),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayloadBase.get({
              queryResult: {
                status: 'success',
                data: 'foo',
              },
              queryState: queryStateDiff.get({
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
            queryPayloadBase.get({
              queryState: queryStateDiff.get(),
            })
          ),
        ],
        [
          0,
          testActions.queryStarted(
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayloadBase.get({
              queryResult: {
                status: 'success',
                data: 'bar',
              },
              queryState: queryStateDiff.get({
                state: 'idle',
                status: 'query-data',
                data: 'bar',
                dataTimestamp: 0,
              }),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayloadBase.get({}))],
      ]);
    });
    it('query is invalidated when there are subscribers', () => {
      const {
        actions,
        listing,
        testKeys,
        testActions,
        resolveData,
        proceed,
        clearListing,
      } = createTestHarness(true);

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      clearListing();
      actions.dispatch(
        testActions.invalidateQuery({
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'bar');
      proceed();

      const queryPayloadBase = createQueryPayloadBase(testKeys.query.getTest, [
        7,
      ]);
      const queryStateDiff = createQueryStateDiff(testKeys.query.getTest, [7]);

      expect(listing).toEqual([
        [
          0,
          testActions.queryInvalidated(
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
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
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
                state: 'fetching',
              }),
            })
          ),
        ],
        [
          0,
          testActions.queryCompleted(
            queryPayloadBase.get({
              queryResult: {
                status: 'success',
                data: 'bar',
              },
              queryState: queryStateDiff.get({
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
        testKeys,
        testActions,
        resolveData,
        proceed,
        clearListing,
      } = createTestHarness(true);

      actions.dispatch(
        testActions.prefetchQuery({
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      resolveData(7, 'foo');
      clearListing();
      actions.dispatch(
        testActions.invalidateQuery({
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      proceed();

      const queryPayloadBase = createQueryPayloadBase(testKeys.query.getTest, [
        7,
      ]);
      const queryStateDiff = createQueryStateDiff(testKeys.query.getTest, [7]);

      expect(listing).toEqual([
        [
          0,
          testActions.queryInvalidated(
            queryPayloadBase.get({
              queryState: queryStateDiff.get({
                data: 'foo',
                dataTimestamp: 0,
                status: 'query-data',
                subscriberKeys: [],
              }),
            })
          ),
        ],
        [TEN_MINUTES, testActions.queryCollected(queryPayloadBase.get())],
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
