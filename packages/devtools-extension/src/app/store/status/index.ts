import {
  createAction,
  createReaction,
  createReducer,
  createSelector,
  filterActions,
  on,
} from '@lib/store';
import { delay, map, of } from 'rxjs';

export const STATUS = 'status';

export interface StatusState {
  status: Status;
}

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

export const statusReactions = {
  init: createReaction(() =>
    of(statusActions.SetStatus({ status: 'connected' }))
  ),
  connectedReaction: createReaction((action$) => {
    return action$.pipe(
      filterActions(
        statusActions.SetStatus,
        (action) => action.payload.status === 'connected'
      ),
      map(() => statusActions.SetStatus({ status: 'disconnected' })),
      delay(1000)
    );
  }),

  disconnectedReaction: createReaction((action$) => {
    return action$.pipe(
      filterActions(
        statusActions.SetStatus,
        (action) => action.payload.status === 'disconnected'
      ),
      map(() => statusActions.SetStatus({ status: 'connected' })),
      delay(1000)
    );
  }),
};
