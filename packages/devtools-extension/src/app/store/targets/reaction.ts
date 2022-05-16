import { combineReactions, createReaction } from '@lib/store';
import { fromServer } from '@lib/operators';
import { createChromeRuntimeServerAdapter, startServer } from '@lib/rpc';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';
import { Target } from '@app/protocols/targets';
import { targetsActions } from '@app/actions/targets-actions';
import { filter, from, map } from 'rxjs';
import { targetsClient } from '@app/clients/targets';

export const targetReaction = combineReactions()
  .add(
    createReaction((action$) =>
      from(targetsClient.getTargets()).pipe(
        filter(Boolean),
        map((targets) => targetsActions.TargetsLoaded({ targets }))
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
  );
