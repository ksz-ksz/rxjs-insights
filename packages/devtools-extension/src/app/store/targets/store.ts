import { targetsActions } from '@app/actions/targets-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { TargetRef } from '@app/protocols/refs';
import { dashboardActions } from '@app/actions/dashboad-actions';
import { typeOf } from '@lib/state-fx/store';
import {
  createStoreComponent,
  StoreDef,
  tx,
} from '../../../lib/state-fx/store/store';

export interface TargetsState {
  targets: TargetRef[];
}

export const targetsStore = createStoreComponent(
  (): StoreDef<TargetsState> => ({
    name: 'targets',
    state: typeOf<TargetsState>({ targets: [] }),
    transitions: {
      targetsLoaded: tx([targetsActions.TargetsLoaded], (state, action) => {
        state.targets = action.payload.targets;
      }),
      targetNotificationReceived: tx(
        [targetsActions.TargetNotificationReceived],
        (state, action) => {
          if (
            !state.targets.find(
              (target) => target.id === action.payload.target.id
            )
          ) {
            state.targets.push(action.payload.target);
          }
        }
      ),
      pinTarget: tx([appBarActions.PinTarget], (state, action) => {
        state.targets.push(action.payload.target);
      }),
      unpinTarget: tx(
        [appBarActions.UnpinTarget, dashboardActions.UnpinTarget],
        (state, action) => {
          state.targets = state.targets.filter(
            (target) => !(target.id === action.payload.target.id)
          );
        }
      ),
    },
  })
);
