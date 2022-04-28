import {
  combineReactions,
  createAction,
  createReaction,
  createReducer,
  createSelector,
  filterActions,
  on,
  Slice,
} from '@lib/store';
import {
  first,
  from,
  interval,
  map,
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

export type StatusSlice = Slice<typeof STATUS, StatusState>;

export const statusActions = {
  SetInstrumentationStatus: createAction<{
    instrumentationStatus: InstrumentationStatus | undefined;
  }>('SetStatus', STATUS),
  InstallInstrumentation: createAction<void>('EnableAndReload', STATUS),
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
    on(statusActions.SetInstrumentationStatus, (state, action) => {
      state.instrumentationStatus = action.payload.instrumentationStatus;
    }),
  ]
);

export const statusReactions = combineReactions()
  .add(
    createReaction(() =>
      from(targetClient.getInstrumentationStatus()).pipe(
        map((instrumentationStatus) =>
          statusActions.SetInstrumentationStatus({ instrumentationStatus })
        )
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(statusActions.InstallInstrumentation),
        tapAsync(async () => {
          await targetClient.installInstrumentation();
        }),
        switchMap(() =>
          race([
            interval(100).pipe(
              switchMap(() => from(targetClient.getInstrumentationStatus())),
              first(
                (instrumentationStatus) =>
                  instrumentationStatus !== 'not-available'
              ),
              map((instrumentationStatus) =>
                statusActions.SetInstrumentationStatus({
                  instrumentationStatus,
                })
              )
            ),
            timer(4000).pipe(
              map(() =>
                statusActions.SetInstrumentationStatus({
                  instrumentationStatus: 'not-available',
                })
              )
            ),
          ]).pipe(
            startWith(
              statusActions.SetInstrumentationStatus({
                instrumentationStatus: undefined,
              })
            )
          )
        )
      )
    )
  );
