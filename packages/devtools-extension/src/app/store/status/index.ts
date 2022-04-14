import {
  combineReactions,
  createAction,
  createReaction,
  createReducer,
  createSelector,
  filterActions,
  on,
  Slice,
  Store,
} from '@lib/store';
import { delay, map, of } from 'rxjs';

export const STATUS = 'status';

export interface StatusState {
  status: Status;
}

export type StatusSlice = Slice<typeof STATUS, StatusState>;

export type Status = 'connected' | 'disconnected';

export const statusActions = {
  SetStatus: createAction<{ status: Status }>('SetStatus', STATUS),
};

export const statusSelectors = {
  status: createSelector((state: StatusState) => state.status, STATUS),
};

export const statusReducer = createReducer(
  STATUS,
  { status: 'connected' } as StatusState,
  [
    on(statusActions.SetStatus, (state, action) => {
      state.status = action.payload.status;
    }),
  ]
);

export const statusReactions = combineReactions()
  .add(
    createReaction(
      () => of(statusActions.SetStatus({ status: 'connected' })),
      (store: Store<StatusSlice>) => store.getState().status.status
    )
  )
  .add(
    createReaction((action$) => {
      return action$.pipe(
        filterActions(
          statusActions.SetStatus,
          (action) => action.payload.status === 'connected'
        ),
        map(() => statusActions.SetStatus({ status: 'disconnected' })),
        delay(1000)
      );
    })
  )
  .add(
    createReaction((action$) => {
      return action$.pipe(
        filterActions(
          statusActions.SetStatus,
          (action) => action.payload.status === 'disconnected'
        ),
        map(() => statusActions.SetStatus({ status: 'connected' })),
        delay(1000)
      );
    })
  );
