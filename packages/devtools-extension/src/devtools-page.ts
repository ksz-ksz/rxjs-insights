import { createChromeRuntimeServerAdapter, startServer } from '@lib/rpc';
import {
  FromSourcesPane,
  FromSourcesPaneChannel,
} from '@app/protocols/sources-panel';
import { toSourcesPaneClient } from '@app/clients/sources-panel';

chrome.devtools.panels.create('RxJS Insights', '', '/index.html');
chrome.devtools.panels.sources.createSidebarPane(
  'RxJS Insights - Trace',
  (pane) => {
    pane.setPage('/sources-page.html');
    pane.onShown.addListener(() => {
      void toSourcesPaneClient.onShown();
    });
    startServer<FromSourcesPane>(
      createChromeRuntimeServerAdapter(FromSourcesPaneChannel),
      {
        setHeight(height: number) {
          pane.setHeight(`${height}px`);
        },
      }
    );
  }
);
