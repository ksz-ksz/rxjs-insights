# Webpack setup

To set up the instrumentation, you'll need to add a plugin to the Webpack build configuration.

> Note: Enabling instrumentation has a considerable performance and memory footprint. Make sure not to enable it in production mode.

## 1. Install the instrumentation package

```
npm install --save-dev @rxjs-insights/rxjs7
```

> Note: The version of the `@rxjs-insights/rxjs<version>` package needs to match the version of RxJS.
> For example, if you are using RxJS 6, you need to run `npm install --save-dev @rxjs-insights/rxjs6`.

## 2. Install the plugin package

```
npm install --save-dev @rxjs-insights/plugin-webpack5
```

> Note: The version of the `@rxjs-insights/plugin-webpack<version>` package needs to match the version of Webpack.
> For example, if you are using Webpack 4, you need to run `npm install --save-dev @rxjs-insights/plugin-webpack4`.

## 3. Add the plugin to the build configuration
```js
// developement.webpack.config.js

const { RxjsInsightsPlugin } = require('@rxjs-insights/plugin-webpack5');

module.exports = {
  // (...)
  plugins: [
    new RxjsInsightsPlugin()
  ]
  // (...)
}
```

> Tip: If you want the instrumentation to kick in only when the RxJS Devtools browser extension is active, set the `installMode` configuration option to `'conditional'`.
