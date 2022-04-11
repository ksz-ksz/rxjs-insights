import {
  commandOfType,
  createDomain,
  createEffect,
  createReducer,
  when,
} from '@lib/store';
import { delay, map, startWith, withLatestFrom } from 'rxjs';

export interface StatusDomainState {
  targetStatus?: 'connected' | 'disconnected';
}

export const statusDomain = createDomain<'status', StatusDomainState>('status');

export const statusCommands = {
  SetTargetStatus: statusDomain.createCommand<{
    targetStatus: 'connected' | 'disconnected';
  }>('SetTargetStatus'),
};

export const statusQueries = {
  targetStatus: statusDomain.createQuery((state) => state.targetStatus),
};

const reducer = createReducer<StatusDomainState>([
  when(statusCommands.SetTargetStatus, (state, payload) => {
    state.targetStatus = payload.targetStatus;
  }),
]);

const setStatusInterval = createEffect(
  (command$, { targetStatus }) =>
    command$.pipe(
      commandOfType(statusCommands.SetTargetStatus),
      withLatestFrom(targetStatus),
      map(([, targetStatus]) =>
        targetStatus === 'connected' ? 'disconnected' : 'connected'
      ),
      delay(1000),
      startWith('connected' as const),
      map((targetStatus) => statusCommands.SetTargetStatus({ targetStatus }))
    ),
  (store) => ({
    targetStatus: store.query(statusQueries.targetStatus),
  })
);

const effects = [setStatusInterval];

export const statusSlice = statusDomain.createSlice({
  initialState: {},
  reducer,
  effects,
});
