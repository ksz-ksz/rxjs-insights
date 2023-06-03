# Devtools setup

## Prerequisites

1. Instrumentation is set up in the application. See the [instrumentation setup guide](../instrumentation/setup/index.md) for more information.
2. RxJS Insights Devtools browser extension is installed. Go to the [Chrome Web Store](https://chrome.google.com/webstore/detail/rxjs-insights/nndeaiihppbmgiejbpbpkohdhilffdgj) or [Firefox Browser Add-ons](https://addons.mozilla.org/en-US/firefox/addon/rxjs-insights/).

## 1. Install the RxJS Insights Devtools package
```
npm install --save-dev @rxjs-insights/devtools
```

## 2. Connect to the RxJS Insights Devtools Extension from the application

It's recommended to call the `connect` function during the application bootstrap phase (i.e. as early as possible), however it should be possible to connect at any point in time.

```ts
import { connect } from '@rxjs-insights/devtools/connect';

connect();
```

> Note: The `connect()` function returns a Promise that resolves to `true` if the connection was established or `false` otherwise.
> After the call the devtools will be awaited for the amount of time specified by the optional function parameter (one second by default).
> It's not recommended to wait with bootstrapping the app until the Promise resolves as it will result in additional delay for anyone that does not have the devtools installed.
> However, it might be handy for small test/POC apps or when you just want to test some RxJS code in a sandbox (e.g. on StackBlitz).
