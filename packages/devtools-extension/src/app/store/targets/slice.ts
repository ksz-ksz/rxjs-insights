import { createReducer, Slice } from '@lib/store';
import { Target } from '@app/protocols/targets';
import { targetsActions } from '@app/actions/targets-actions';
import { appBarActions } from '@app/actions/app-bar-actions';

export interface TargetsState {
  targets: Target[];
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
      (target) =>
        !(
          target.type === action.payload.target.type &&
          target.id === action.payload.target.id
        )
    );
  });
