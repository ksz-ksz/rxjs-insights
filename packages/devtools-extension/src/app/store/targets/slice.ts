import { createReducer, Slice } from '@lib/store';
import { targetsActions } from '@app/actions/targets-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { TargetRef } from '@app/protocols/refs';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';

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
    if (
      !state.targets.find((target) => target.id === action.payload.target.id)
    ) {
      state.targets.push(action.payload.target);
    }
  })
  .add(targetsActions.PinTarget, (state, action) => {
    state.targets.push(action.payload.target);
  })
  .add(targetsActions.UnpinTarget, (state, action) => {
    state.targets = state.targets.filter(
      (target) => !(target.id === action.payload.target.id)
    );
  });
