import { createResourceKeys } from './resource-key';
import { createResourceStore, QueryState } from './resource-store';
import { createResourceActions } from './resource-actions';
import { createResourceEffect } from './resource-effect';
import { merge, Subject, VirtualTimeScheduler } from 'rxjs';
import { Action, actionsComponent, createContainer } from '../store';
import { schedulerComponent } from './scheduler';

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
  const listing: Action[] = [];
  merge(
    actions.ofType(testActions.querySubscribed),
    actions.ofType(testActions.queryUnsubscribed),
    actions.ofType(testActions.queryStarted),
    actions.ofType(testActions.queryCompleted),
    actions.ofType(testActions.queryCancelled)
  ).subscribe((action) => listing.push(action));

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
  };
}

describe('Query', () => {
  describe('when subscribed', () => {
    it('should emit actions', () => {
      const { actions, listing, testKeys, testActions, proceed, resolveData } =
        createTestHarness();

      actions.dispatch(
        testActions.subscribeQuery({
          subscriberKey: 'subscriber',
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
        })
      );
      proceed();
      resolveData(7, 'foo');

      expect(listing).toEqual([
        testActions.querySubscribed({
          subscriberKey: 'subscriber',
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
          queryHash: 'getTest::[7]',
          queryState: {
            status: 'initial',
            state: 'inactive',
            queryKey: testKeys.query.getTest,
            queryArgs: [7],
            queryHash: 'getTest::[7]',
            data: undefined,
            error: undefined,
            dataTimestamp: undefined,
            errorTimestamp: undefined,
            staleTimestamp: undefined,
            cacheTimestamp: undefined,
            volatileQueryOptions: {
              cacheTime: TEN_MINUTES,
            },
            subscribers: [
              {
                subscriberKey: 'subscriber',
                options: {
                  cacheTime: TEN_MINUTES,
                  staleTime: Infinity,
                },
              },
            ],
          },
        }),
        testActions.queryStarted({
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
          queryHash: 'getTest::[7]',
          queryState: {
            status: 'initial',
            state: 'active',
            queryKey: testKeys.query.getTest,
            queryArgs: [7],
            queryHash: 'getTest::[7]',
            data: undefined,
            error: undefined,
            dataTimestamp: undefined,
            errorTimestamp: undefined,
            staleTimestamp: undefined,
            cacheTimestamp: undefined,
            volatileQueryOptions: {
              cacheTime: TEN_MINUTES,
            },
            subscribers: [
              {
                subscriberKey: 'subscriber',
                options: {
                  cacheTime: TEN_MINUTES,
                  staleTime: Infinity,
                },
              },
            ],
          },
        }),
        testActions.queryCompleted({
          queryKey: testKeys.query.getTest,
          queryArgs: [7],
          queryHash: 'getTest::[7]',
          queryResult: {
            status: 'success',
            data: 'foo',
          },
          queryState: {
            status: 'query-data',
            state: 'inactive',
            queryKey: testKeys.query.getTest,
            queryArgs: [7],
            queryHash: 'getTest::[7]',
            data: 'foo',
            error: undefined,
            dataTimestamp: 0,
            errorTimestamp: undefined,
            staleTimestamp: Infinity,
            cacheTimestamp: TEN_MINUTES,
            volatileQueryOptions: {
              cacheTime: TEN_MINUTES,
            },
            subscribers: [
              {
                subscriberKey: 'subscriber',
                options: {
                  cacheTime: TEN_MINUTES,
                  staleTime: Infinity,
                },
              },
            ],
          },
        }),
      ]);
    });
  });
});
