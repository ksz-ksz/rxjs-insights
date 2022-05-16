import { createReducer, on } from '@lib/store';
import { targets, TargetsState } from '@app/store/targets/slice';
import { targetsActions } from '@app/store/targets/actions';
import { appBarActions } from '@app/actions/app-bar-actions';

export const targetsReducer = createReducer(
  targets,
  { targets: [] } as TargetsState,
  [
    on(targetsActions.TargetsLoaded, (state, action) => {
      state.targets = action.payload.targets;
    }),
    on(targetsActions.TargetNotificationReceived, (state, action) => {
      state.targets.push(action.payload.target);
    }),
    on(appBarActions.CloseTarget, (state, action) => {
      state.targets = state.targets.filter(
        (target) =>
          !(
            target.type === action.payload.target.type &&
            target.id === action.payload.target.id
          )
      );
    }),
  ]
);
