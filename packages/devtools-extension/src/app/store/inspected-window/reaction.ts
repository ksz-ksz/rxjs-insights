import { createReaction } from '@lib/store';
import { fromChromeEvent } from '@app/utils';
import { EMPTY, of, switchMap } from 'rxjs';
import { inspectedWindowActions } from '@app/store/inspected-window/actions';

export const inspectedWindowReaction = createReaction(() =>
  fromChromeEvent(chrome.webNavigation.onCompleted).pipe(
    switchMap(([event]) =>
      event.tabId === chrome.devtools.inspectedWindow.tabId
        ? of(inspectedWindowActions.InspectedWindowReloaded())
        : EMPTY
    )
  )
);
