import {
  createChromeRuntimeClientAdapter,
  createChromeRuntimeServerAdapter,
  createClient,
  startServer,
} from '@lib/rpc';
import {
  FromSourcesPane,
  FromSourcesPaneChannel,
  ToSourcesPane,
  ToSourcesPaneChannel,
} from '@app/protocols/sources-panel';
import { EventRef } from '@app/protocols/refs';
import ExtensionSidebarPane = chrome.devtools.panels.ExtensionSidebarPane;

chrome.devtools.panels.create(
  'RxJS Insights',
  'icons/rxjs-insights-128.png',
  'index.html'
);

if (typeof chrome.devtools.panels.sources.createSidebarPane === 'function') {
  let callStackPane: ExtensionSidebarPane;
  let scopePane: ExtensionSidebarPane;

  const toSourcesPaneClient = createClient<ToSourcesPane>(
    createChromeRuntimeClientAdapter(ToSourcesPaneChannel)
  );

  startServer<FromSourcesPane>(
    createChromeRuntimeServerAdapter(FromSourcesPaneChannel),
    {
      setHeight(height: number) {
        callStackPane.setHeight(`${Math.ceil(height)}px`);
      },

      setScope(ref: EventRef | undefined) {
        console.log('setScope', ref);
        if (ref) {
          scopePane.setExpression(
            // language=js
            `
          (()=>{
            const event = window.RXJS_INSIGHTS_REFS.getObject(${ref.objectId});
            
            const scope = Object.create(null);
            scope.$event = event;
            scope.$target = event.target;
            if (event.type === 'next') {
              scope.value = event.declaration.args[0];
            }
            if (event.type === 'error') {
              scope.error = event.declaration.args[0];
            }
            if (event.type === 'subscribe') {
              switch (event.declaration.args.length) {
                case 0: break;
                case 1: 
                  scope.subscriber = event.declaration.args[0];
                  break;
                default:
                  scope.subscriber = event.declaration.args;
              }
            }
            return scope;
          })()
          `
          );
        } else {
          scopePane.setExpression('null');
        }
      },
    }
  );

  chrome.devtools.panels.sources.createSidebarPane(
    'RxJS Insights - Scope',
    (pane) => {
      scopePane = pane;
    }
  );

  chrome.devtools.panels.sources.createSidebarPane(
    'RxJS Insights - Call Stack',
    (pane) => {
      callStackPane = pane;
      pane.setPage('/sources-page.html');
      pane.onShown.addListener(() => {
        void toSourcesPaneClient.onShown();
      });
    }
  );
}
