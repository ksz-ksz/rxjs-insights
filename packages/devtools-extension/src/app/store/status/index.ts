import {
  combineReactions,
  createAction,
  createReaction,
  createReducer,
  createSelector,
  filterActions,
  on,
} from '@lib/store';
import {
  first,
  from,
  map,
  Observable,
  race,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { createClient, createInspectedWindowEvalClientAdapter } from '@lib/rpc';
import {
  InstrumentationStatus,
  TargetStatus,
  TargetStatusChannel,
} from '@app/protocols';
import { tapAsync } from '@lib/operators';

const targetClient = createClient<TargetStatus>(
  createInspectedWindowEvalClientAdapter(TargetStatusChannel)
);

export const STATUS = 'status';

export interface StatusState {
  instrumentationStatus: InstrumentationStatus | undefined;
}

export const statusActions = {
  AwaitInstrumentationRequested: createAction<void>(
    'AwaitInstrumentationRequested',
    STATUS
  ),
  InstallInstrumentationRequested: createAction<void>(
    'InstallInstrumentationRequested',
    STATUS
  ),
  InstrumentationStatusResolved: createAction<{
    instrumentationStatus: InstrumentationStatus | undefined;
  }>('InstrumentationStatusResolved', STATUS),
};

export const statusSelectors = {
  instrumentationStatus: createSelector(
    (state: StatusState) => state.instrumentationStatus,
    STATUS
  ),
};

export const statusReducer = createReducer(
  STATUS,
  { instrumentationStatus: undefined } as StatusState,
  [
    on(statusActions.InstrumentationStatusResolved, (state, action) => {
      state.instrumentationStatus = action.payload.instrumentationStatus;
    }),
  ]
);

function fromChromeEvent<T extends (...args: any[]) => any>(
  event: chrome.events.Event<T>
): Observable<Parameters<T>> {
  return new Observable<Parameters<T>>((observer) => {
    const callback = (...args: Parameters<T>) => {
      observer.next(args);
    };
    event.addListener(callback as any);

    return () => {
      event.removeListener(callback as any);
    };
  });
}

export const statusReactions = combineReactions()
  .add(
    createReaction(() =>
      from(targetClient.getInstrumentationStatus()).pipe(
        map((instrumentationStatus) =>
          statusActions.InstrumentationStatusResolved({ instrumentationStatus })
        )
      )
    )
  )
  .add(
    createReaction(() =>
      fromChromeEvent(chrome.webNavigation.onCompleted).pipe(
        map(() => statusActions.AwaitInstrumentationRequested())
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(statusActions.AwaitInstrumentationRequested),
        switchMap(() =>
          race([
            timer(1000, 100).pipe(
              switchMap(() => from(targetClient.getInstrumentationStatus())),
              first(
                (instrumentationStatus) =>
                  instrumentationStatus !== 'not-available'
              ),
              map((instrumentationStatus) =>
                statusActions.InstrumentationStatusResolved({
                  instrumentationStatus,
                })
              )
            ),
            timer(4000).pipe(
              map(() =>
                statusActions.InstrumentationStatusResolved({
                  instrumentationStatus: 'not-available',
                })
              )
            ),
          ]).pipe(
            startWith(
              statusActions.InstrumentationStatusResolved({
                instrumentationStatus: undefined,
              })
            )
          )
        )
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(statusActions.InstallInstrumentationRequested),
        tapAsync(async () => {
          await targetClient.installInstrumentation();
        })
      )
    )
  );
