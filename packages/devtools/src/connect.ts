import { Env, getGlobalEnv } from '@rxjs-insights/core';
import { InspectFunction, setInspectFunction } from './inspect';

declare global {
  interface Window {
    RXJS_INSIGHTS_CONNECT?(env: Env): InspectFunction;
  }
}

function connectWithDevtools() {
  const inspect = window.RXJS_INSIGHTS_CONNECT!(getGlobalEnv());
  if (inspect) {
    console.info('RxJS Insights: connected with the devtools.');
    setInspectFunction(inspect);
  }
}

export function connect(): Promise<void> {
  return new Promise((resolve) => {
    if (window.RXJS_INSIGHTS_CONNECT) {
      connectWithDevtools();
      resolve();
    } else {
      let timeout = -1;
      function devtoolsReadyListener() {
        clearTimeout(timeout);
        connectWithDevtools();
        resolve();
      }
      const type = '@rxjs-insights/devtools-ready';
      document.addEventListener(type, devtoolsReadyListener);
      timeout = window.setTimeout(() => {
        document.removeEventListener(type, devtoolsReadyListener);
        console.warn(
          'RxJS Insights: could not connect with the devtools. Make sure that the RxJS Devtools extension is installed and enabled.'
        );
        resolve();
      }, 4000);
    }
  });
}
