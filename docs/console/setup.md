# Console setup

## 1. Install the RxJS Insights Console package
```
npm install --save-dev @rxjs-insights/console
```

## 2. Expose the RxJS Insights Console in a global variable (optional)

Sometimes it's useful to have access to the console inspector functions during debugging.

```ts
import * as rxjsInsightsConsole from "@rxjs-insights/console";

(window as any).rxjsInsightsConsole = rxjsInsightsConsole;
```

```js
// later, during debugging

rxjsInsightsConsole.stats(someObservableOrSubscription);
```
