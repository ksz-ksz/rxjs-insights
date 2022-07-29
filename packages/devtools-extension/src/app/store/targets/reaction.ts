import {
  combineReactions,
  createReaction,
  effect,
  filterActions,
} from '@lib/store';
import { fromServer } from '@lib/operators';
import { createChromeRuntimeServerAdapter, startServer } from '@lib/rpc';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';
import { targetsActions } from '@app/actions/targets-actions';
import { filter, from, map, startWith, switchMap } from 'rxjs';
import { targetsClient } from '@app/clients/targets';
import { appBarActions } from '@app/actions/app-bar-actions';
import { inspectedWindowActions } from '@app/actions/inspected-window-actions';
import { TargetRef } from '@app/protocols/refs';

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
        filterActions(appBarActions.CloseTarget),
        effect((action) => {
          void targetsClient.releaseTarget(action.payload.targetId);
        })
      )
    )
  );
