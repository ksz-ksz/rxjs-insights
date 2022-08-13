# Devtools setup

## Prerequisites

1. Instrumentation is set up in the application. See the [instrumentation setup guide](../instrumentation/setup/index.md) for more information.
2. RxJS Insights Devtools browser extension is installed.

## 1. Install the RxJS Insights Devtools package
```
npm install --save-dev @rxjs-insights/devtools
```

## 2. Connect to the RxJS Devtools browser extension from the application

It's recommended to call the `connect` function during the application bootstrap phase (i.e. as early as possible).

```ts
import { connect } from '@rxjs-insights/devtools/connect';

connect();
```
