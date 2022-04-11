import { createDomain, createReducer, Effect, when } from '@lib/store';

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

const effects: Effect[] = [];

export const statusSlice = statusDomain.createSlice({
  initialState: {},
  reducer,
  effects,
});
