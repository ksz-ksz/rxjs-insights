import {
  Action,
  combineReactions,
  createReaction,
  createSelector,
  effect,
  filterActions,
  Store,
} from '@lib/store';
import { fromServer } from '@lib/operators';
import { createChromeRuntimeServerAdapter, startServer } from '@lib/rpc';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';
import { targetsActions } from '@app/actions/targets-actions';
import {
  concatMap,
  distinctUntilChanged,
  filter,
  from,
  map,
  pairwise,
  startWith,
  switchMap,
} from 'rxjs';
import { targetsClient } from '@app/clients/targets';
import { inspectedWindowActions } from '@app/actions/inspected-window-actions';
import { TargetRef } from '@app/protocols/refs';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { RouterSlice } from '@app/store/router';
import { InsightsSlice } from '@app/store/insights';

const activeTargetSelector = createSelector(
  [activeTargetStateSelector],
  ([activeTargetState]) => {
    if (activeTargetState) {
      const { target } = activeTargetState;
      return target;
    } else {
      return undefined;
    }
  }
);

export const targetReaction = combineReactions()
  .add(
    createReaction((actions$) =>
      actions$.pipe(
        filterActions(inspectedWindowActions.InspectedWindowReloaded),
        startWith(undefined),
        switchMap(() =>
          from(targetsClient.getTargets()).pipe(
            filter(Boolean),
            map((targets) => targetsActions.TargetsLoaded({ targets }))
          )
        )
      )
    )
  )
  .add(
    createReaction(() =>
      fromServer((observer) =>
        startServer<TargetsNotifications>(
          createChromeRuntimeServerAdapter(TargetsNotificationsChannel),
          {
            notifyTarget(target: TargetRef) {
              observer.next(
                targetsActions.TargetNotificationReceived({ target })
              );
            },
          }
        )
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(targetsActions.PinTarget),
        effect((action) => {
          void targetsClient.pinTarget(action.payload.target.objectId);
        })
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(targetsActions.UnpinTarget),
        effect((action) => {
          void targetsClient.unpinTarget(action.payload.target.objectId);
        })
      )
    )
  )
  .add(
    createReaction(
      (action$, { activeTarget$ }) =>
        activeTarget$.pipe(
          startWith(undefined),
          pairwise(),
          concatMap(([prevTarget, nextTarget]) => {
            const actions: Action[] = [];
            if (prevTarget) {
              void targetsClient.unlockTarget(prevTarget.objectId);
            }
            if (nextTarget) {
              void targetsClient.lockTarget(nextTarget.objectId);
            }
            return actions;
          })
        ),
      (store: Store<RouterSlice & InsightsSlice>) => ({
        activeTarget$: store
          .select(activeTargetSelector)
          .pipe(distinctUntilChanged()),
      })
    )
  );
