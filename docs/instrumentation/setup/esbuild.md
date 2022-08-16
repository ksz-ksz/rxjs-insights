# ESBuild setup

To set up the instrumentation, you'll need to add a plugin to the ESBuild build configuration.

> Note: Enabling instrumentation has a considerable performance and memory footprint. Make sure not to enable it in production mode.

## 1. Install the instrumentation package

```
npm install --save-dev @rxjs-insights/rxjs7
```

> Note: The version of the `@rxjs-insights/rxjs<version>` package needs to match the version of RxJS.
> For example, if you are using RxJS 6, you need to run `npm install --save-dev @rxjs-insights/rxjs6`.

## 2. Install the plugin package

```
npm install --save-dev @rxjs-insights/plugin-esbuild
```

## 3. Add the plugin to the build configuration

```js
// development.build.js

const esbuild = require('esbuild');
const { rxjsInsightsPlugin } = require('@rxjs-insights/plugin-esbuild');

esbuild.build({
  // (...)
  plugins: [rxjsInsightsPlugin()]
  // (...)
});
```
