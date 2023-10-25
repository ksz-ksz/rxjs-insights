import { fromServer } from '@lib/operators';
import { createChromeRuntimeServerAdapter, startServer } from '@lib/rpc';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';
import { targetsActions } from '@app/actions/targets-actions';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  from,
  map,
  merge,
  pairwise,
  startWith,
  switchMap,
} from 'rxjs';
import { targetsClient } from '@app/clients/targets';
import { TargetRef } from '@app/protocols/refs';
import { dashboardActions } from '@app/actions/dashboad-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { routeActivated } from '@app/utils';
import { createEffect, effect, select } from '@lib/state-fx/store';
import { routerActions } from '@app/router';
import { dashboardRoute } from '@app/routes';
import {
  activeTargetState,
  selectActiveTarget,
} from '@app/selectors/active-target-state-selector';

export const targetEffect = createEffect({
  namespace: 'target',
  deps: [activeTargetState],
})({
  handleDashboardEnter(actions) {
    return actions.select(routeActivated(routerActions, dashboardRoute)).pipe(
      switchMap(() =>
        from(targetsClient.getTargets()).pipe(
          filter(Boolean),
          map((targets) => targetsActions.TargetsLoaded({ targets })),
          catchError(() => EMPTY)
        )
      )
    );
  },
  handleTargetsNotifications() {
    return fromServer((observer) =>
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
    );
  },
  handlePinTarget(actions) {
    return actions.ofType(appBarActions.PinTarget).pipe(
      effect((action) => {
        void targetsClient.pinTarget(action.payload.target.objectId);
      })
    );
  },
  handleUnpinTarget(actions) {
    return merge(
      actions.ofType(appBarActions.UnpinTarget),
      actions.ofType(dashboardActions.UnpinTarget)
    ).pipe(
      effect((action) => {
        void targetsClient.unpinTarget(action.payload.target.objectId);
      })
    );
  },
  handleLockToggle(actions, [activeTargets]) {
    return activeTargets.getStateObservable().pipe(
      select(selectActiveTarget),
      distinctUntilChanged(),
      startWith(undefined),
      pairwise(),
      effect(([prevTarget, nextTarget]) => {
        if (prevTarget) {
          void targetsClient.unlockTarget(prevTarget.objectId);
        }
        if (nextTarget) {
          void targetsClient.lockTarget(nextTarget.objectId);
        }
      })
    );
  },
});
