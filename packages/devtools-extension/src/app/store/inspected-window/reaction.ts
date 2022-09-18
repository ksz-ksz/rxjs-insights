import { createReaction } from '@lib/store';
import { fromServer } from '@lib/operators';
import { createChromeRuntimeServerAdapter, startServer } from '@lib/rpc';
import {
  ReloadNotification,
  ReloadNotificationChannel,
} from '@app/protocols/reload-notification';
import { inspectedWindowActions } from '@app/actions/inspected-window-actions';

export const inspectedWindowReaction = createReaction(() =>
  fromServer((observer) =>
    startServer<ReloadNotification>(
      createChromeRuntimeServerAdapter(
        ReloadNotificationChannel + chrome.devtools.inspectedWindow.tabId
      ),
      {
        notifyReload() {
          observer.next(inspectedWindowActions.InspectedWindowReloaded());
        },
      }
    )
  )
);
