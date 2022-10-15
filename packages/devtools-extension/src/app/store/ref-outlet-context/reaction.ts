import {
  combineReactions,
  createReaction,
  effect,
  filterActions,
} from '@lib/store';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';
import { openResourceAvailable } from '@app/features';
import { consoleClient } from '@app/clients/console';

export const refOutletContextReaction = combineReactions()
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(refOutletContextActions.OpenLocation),
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
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(refOutletContextActions.StoreObjectAsGlobalVariable),
        effect((action) => {
          void consoleClient.storeObject(action.payload.objectId);
        })
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(refOutletContextActions.InspectObjectInConsole),
        effect((action) => {
          void consoleClient.printObject(action.payload.objectId);
        })
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(refOutletContextActions.StoreValueAsGlobalVariable),
        effect((action) => {
          void consoleClient.storeValue(action.payload.value);
        })
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(refOutletContextActions.InspectValueInConsole),
        effect((action) => {
          void consoleClient.printValue(action.payload.value);
        })
      )
    )
  );
