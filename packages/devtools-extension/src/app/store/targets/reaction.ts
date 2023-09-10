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
  catchError,
  concatMap,
  distinctUntilChanged,
  EMPTY,
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
import { dashboardActions } from '@app/actions/dashboad-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { dashboardRouteToken, old_router } from '@app/old_router';
import { filterRoute } from '@lib/store-router';
import { routeEnter } from '@app/utils';

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
        routeEnter(dashboardRouteToken),
        switchMap(() =>
          from(targetsClient.getTargets()).pipe(
            filter(Boolean),
            map((targets) => targetsActions.TargetsLoaded({ targets })),
            catchError(() => EMPTY)
          )
        )
      )
    )
  )
  .add(
    createReaction(() =>
      fromServer((observer) =>
        startServer<TargetsNotifications>(
          createChromeRuntimeServerAdapter(
            TargetsNotificationsChannel + chrome.devtools.inspectedWindow.tabId
          ),
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
        filterActions(appBarActions.PinTarget),
        effect((action) => {
          void targetsClient.pinTarget(action.payload.target.objectId);
        })
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions([
          appBarActions.UnpinTarget,
          dashboardActions.UnpinTarget,
        ]),
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
