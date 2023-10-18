import { effect } from '@lib/store';
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
  Observable,
  OperatorFunction,
  pairwise,
  startWith,
  switchMap,
} from 'rxjs';
import { targetsClient } from '@app/clients/targets';
import { TargetRef } from '@app/protocols/refs';
import { dashboardActions } from '@app/actions/dashboad-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { routeActivated } from '@app/utils';
import {
  createEffect,
  createSelectorFunction,
  Selector,
} from '@lib/state-fx/store';
import { routerActions, routerStore } from '@app/router';
import { insightsStore } from '@app/store/insights/store';
import { dashboardRoute } from '@app/routes';
import { activeTargetSelector } from '@app/selectors/active-target-state-selector';

function select<TState, TArgs extends any[], TResult>(
  selector: Selector<TState, TArgs, TResult>,
  ...args: TArgs
): OperatorFunction<TState, TResult> {
  return (source: Observable<TState>) =>
    new Observable((observer) => {
      const fn = createSelectorFunction(selector);

      return source
        .pipe(map((state) => fn(state, ...args)))
        .subscribe(observer);
    });
}

export const targetEffect = createEffect({
  namespace: 'target',
  deps: [routerStore, insightsStore],
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
  handleLockToggle(actions, deps) {
    return deps.getStateObservable().pipe(
      select(activeTargetSelector),
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
