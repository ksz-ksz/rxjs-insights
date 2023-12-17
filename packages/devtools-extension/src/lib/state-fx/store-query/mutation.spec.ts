import {
  Action,
  actionsComponent,
  ActionType,
  createContainer,
} from '@lib/state-fx/store';
import { merge, Observable, Subject, VirtualTimeScheduler } from 'rxjs';
import { Result } from './result';
import { schedulerComponent } from './scheduler';
import { createResourceKeys } from './resource-key';
import { createResourceActions } from './resource-actions';
import { createResourceStore } from './resource-store';
import { createResourceEffect } from './resource-effect';
import { queries } from './queries';
import { mutations } from './mutations';

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

describe('Mutation', () => {
  it('should work', () => {
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

    resolveData(7, 'done');
    proceed();
    expect(listing).toEqual(0);
  });
});
