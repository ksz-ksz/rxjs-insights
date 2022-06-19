import { createReducer, Slice } from '@lib/store';
import { targetsActions } from '@app/actions/targets-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { TargetRef } from '@app/protocols/refs';

export interface TargetsState {
  targets: TargetRef[];
}

export type TargetsSlice = Slice<'targets', TargetsState>;

export const targetsReducer = createReducer('targets', {
  targets: [],
} as TargetsState)
  .add(targetsActions.TargetsLoaded, (state, action) => {
    state.targets = action.payload.targets;
  })
  .add(targetsActions.TargetNotificationReceived, (state, action) => {
    state.targets.push(action.payload.target);
  })
  .add(appBarActions.CloseTarget, (state, action) => {
    state.targets = state.targets.filter(
      (target) => !(target.id === action.payload.targetId)
    );
  });
