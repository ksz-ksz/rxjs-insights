import { fromServer } from '@lib/operators';
import { createChromeRuntimeServerAdapter, startServer } from '@lib/rpc';
import {
  ReloadNotification,
  ReloadNotificationChannel,
} from '@app/protocols/reload-notification';
import { inspectedWindowActions } from '@app/actions/inspected-window-actions';
import { createEffectComponent } from '@lib/state-fx/store';

export const inspectedWindowEffect = createEffectComponent(() => ({
  name: 'inspected-window',
  effects: {
    reloadNotifier: () =>
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
      ),
  },
}));
