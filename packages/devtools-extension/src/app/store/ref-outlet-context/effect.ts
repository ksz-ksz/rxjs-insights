import { effect } from '@lib/store';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';
import { openResourceAvailable } from '@app/features';
import { consoleClient } from '@app/clients/console';
import { createEffect } from '@lib/state-fx/store';

export const refOutletContextEffect = createEffect({
  namespace: 'ref-outlet-context',
})({
  openLocation(actions) {
    return actions.ofType(refOutletContextActions.OpenLocation).pipe(
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
  storeObject(actions) {
    return actions
      .ofType(refOutletContextActions.StoreObjectAsGlobalVariable)
      .pipe(
        effect((action) => {
          void consoleClient.storeObject(action.payload.objectId);
        })
      );
  },
  inspectObject(actions) {
    return actions.ofType(refOutletContextActions.InspectObjectInConsole).pipe(
      effect((action) => {
        void consoleClient.printObject(action.payload.objectId);
      })
    );
  },
  storeValue(actions) {
    return actions
      .ofType(refOutletContextActions.StoreValueAsGlobalVariable)
      .pipe(
        effect((action) => {
          void consoleClient.storeValue(action.payload.value);
        })
      );
  },
  inspectValue(actions) {
    return actions.ofType(refOutletContextActions.InspectValueInConsole).pipe(
      effect((action) => {
        void consoleClient.printValue(action.payload.value());
      })
    );
  },
});
