import { getGlobalEnv } from '@rxjs-insights/core';
import { setInspectFunction } from './inspect';

export function connect() {
  // @ts-ignore
  const connect = window.RXJS_INSIGHTS_CONNECT;

  if (connect) {
    const inspect = connect(getGlobalEnv());
    if (inspect) {
      setInspectFunction(inspect);
    }
  } else {
    // TODO: add link
    console.warn('RxJS Insights: Devtools extension is not installed.');
  }
}
