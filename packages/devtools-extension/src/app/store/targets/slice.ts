import { on, Slice } from '@lib/store';
import { Target } from '@app/protocols/targets';
import { targetsActions } from '@app/actions/targets-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { createSlice } from '../../../lib/store/slice';

export const targets = 'targets';

export interface TargetsState {
  targets: Target[];
}

export type TargetsSlice = Slice<typeof targets, TargetsState>;

export const { reducer: targetsReducer, selector: targetsSelector } =
  createSlice(targets, { targets: [] } as TargetsState, [
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
  ]);
