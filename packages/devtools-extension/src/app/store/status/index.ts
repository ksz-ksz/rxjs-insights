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
import { TargetStatus } from '@app/protocols';
import { tapAsync } from '@lib/operators';

const targetClient = createClient<TargetStatus>(
  createInspectedWindowEvalClientAdapter('target')
);

export const STATUS = 'status';

export interface StatusState {
  status: Status;
}

export type StatusSlice = Slice<typeof STATUS, StatusState>;

export type Status = 'enabled' | 'disabled' | 'unknown';

export const statusActions = {
  SetStatus: createAction<{ status: Status }>('SetStatus', STATUS),
  EnableAndReload: createAction<void>('EnableAndReload', STATUS),
};

export const statusSelectors = {
  status: createSelector((state: StatusState) => state.status, STATUS),
};

export const statusReducer = createReducer(
  STATUS,
  { status: 'unknown' } as StatusState,
  [
    on(statusActions.SetStatus, (state, action) => {
      state.status = action.payload.status;
    }),
  ]
);

export const statusReactions = combineReactions()
  .add(
    createReaction(() =>
      from(targetClient.isEnabled()).pipe(
        map((enabled) =>
          statusActions.SetStatus({ status: enabled ? 'enabled' : 'disabled' })
        )
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(statusActions.EnableAndReload),
        tapAsync(async () => {
          await targetClient.setEnabled(true);
          await chrome.devtools.inspectedWindow.reload({});
        }),
        switchMap(() =>
          race([
            interval(100).pipe(
              switchMap(() => from(targetClient.isEnabled())),
              first((enabled) => enabled === true),
              map(() => statusActions.SetStatus({ status: 'enabled' }))
            ),
            timer(4000).pipe(
              map(() => statusActions.SetStatus({ status: 'disabled' }))
            ),
          ]).pipe(startWith(statusActions.SetStatus({ status: 'unknown' })))
        )
      )
    )
  );
