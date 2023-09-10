import { effect } from '@lib/store';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';
import { openResourceAvailable } from '@app/features';
import { consoleClient } from '@app/clients/console';
import { createEffect } from '@lib/state-fx/store';
import { filter } from 'rxjs';

export const refOutletContextEffect = createEffect({
  namespace: 'ref-outlet-context',
  effects: {
    openLocation(action$) {
      return action$.pipe(
        filter(refOutletContextActions.OpenLocation.is),
        effect((action) => {
          if (openResourceAvailable) {
            const location = action.payload.location;
            chrome.devtools.panels.openResource(
              location.file,
              location.line - 1,
              () => {}
            );
          }
        })
      );
    },
    storeObject(action$) {
      return action$.pipe(
        filter(refOutletContextActions.StoreObjectAsGlobalVariable.is),
        effect((action) => {
          void consoleClient.storeObject(action.payload.objectId);
        })
      );
    },
    inspectObject(action$) {
      return action$.pipe(
        filter(refOutletContextActions.InspectObjectInConsole.is),
        effect((action) => {
          void consoleClient.printObject(action.payload.objectId);
        })
      );
    },
    storeValue(action$) {
      return action$.pipe(
        filter(refOutletContextActions.StoreValueAsGlobalVariable.is),
        effect((action) => {
          void consoleClient.storeValue(action.payload.value);
        })
      );
    },
    inspectValue(action$) {
      return action$.pipe(
        filter(refOutletContextActions.InspectValueInConsole.is),
        effect((action) => {
          void consoleClient.printValue(action.payload.value());
        })
      );
    },
  },
});
