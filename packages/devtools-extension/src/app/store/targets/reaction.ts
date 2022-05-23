import {
  combineReactions,
  createReaction,
  effect,
  filterActions,
  select,
  Store,
} from '@lib/store';
import { fromServer } from '@lib/operators';
import { createChromeRuntimeServerAdapter, startServer } from '@lib/rpc';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';
import { Target } from '@app/protocols/targets';
import { targetsActions } from '@app/actions/targets-actions';
import {
  EMPTY,
  filter,
  from,
  ignoreElements,
  map,
  of,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { targetsClient } from '@app/clients/targets';
import { appBarActions } from '@app/actions/app-bar-actions';
import { RouterSlice } from '@app/store/router';
import { activeTarget } from '@app/selectors/targets-selectors';
import { createUrl } from '@lib/store-router';
import { router } from '@app/router';
import { inspectedWindowActions } from '@app/actions/inspected-window-actions';

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
            notifyTarget(target: Target) {
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
        filterActions(appBarActions.CloseTarget),
        effect((action) => {
          void targetsClient.releaseTarget(action.payload.target);
        })
      )
    )
  )
  .add(
    createReaction(
      (action$, { activeTarget$ }) =>
        action$.pipe(
          filterActions(appBarActions.CloseTarget),
          withLatestFrom(activeTarget$),
          switchMap(([action, activeTarget]) => {
            const target = action.payload.target;
            if (
              activeTarget &&
              target.type === activeTarget.type &&
              target.id === activeTarget.id
            ) {
              return of(
                router.actions.Navigate({ url: createUrl(['dashboard']) })
              );
            } else {
              return EMPTY;
            }
          })
        ),
      (store: Store<RouterSlice>) => ({
        activeTarget$: store.pipe(select(activeTarget)),
      })
    )
  );
