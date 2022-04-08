import { createReducer, when } from '../store-lib';
import { State } from './state';
import { SetTargetStatus } from './commands';

export const reducer = createReducer<State>([
  when(SetTargetStatus, (state, payload) => {
    state.targetStatus = payload.targetStatus;
  }),
]);
