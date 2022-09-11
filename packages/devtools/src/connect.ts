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
    console.info('RxJS Insights: devtools connection established.');
    setInspectFunction(inspect);
    return true;
  } else {
    return false;
  }
}

/**
 * Connects with the RxJS Insights Devtools (https://chrome.google.com/webstore/detail/rxjs-insights/nndeaiihppbmgiejbpbpkohdhilffdgj).
 *
 * @param timeout  the time (in milliseconds) that the devtools will be awaited.
 * @return Promise<boolean>  a Promise that resolves to `true` if the connection was established and the setup is correct, or `false` otherwise.
 */
export function connect(timeout = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.RXJS_INSIGHTS_CONNECT) {
      resolve(connectWithDevtools());
    } else {
      let timeoutId = -1;
      function devtoolsReadyListener() {
        clearTimeout(timeoutId);
        resolve(connectWithDevtools());
      }
      const type = '@rxjs-insights/devtools-ready';
      document.addEventListener(type, devtoolsReadyListener);
      timeoutId = window.setTimeout(() => {
        document.removeEventListener(type, devtoolsReadyListener);
        console.warn(
          'RxJS Insights: could not establish devtools connection. Make sure that the RxJS Insights Devtools Extension is installed and enabled.'
        );
        resolve(false);
      }, timeout);
    }
  });
}
