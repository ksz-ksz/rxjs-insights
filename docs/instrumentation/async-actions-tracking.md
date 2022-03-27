# Async actions tracking

By default, RxJS Insights tracks async actions by instrumenting RxJS schedulers.
However, this approach is limited, as it does not allow tracking actions triggered by direct `setTimeout` and `setInterval` calls, REST requests, DOM events, etc.
To enable tracking all kinds of async actions, Zone.js needs to be installed.

> Note: Zone.js is already installed if you are using Angular.

## 1. Install the Zone.js package

```
npm install --save-dev zone.js
```

## 2. Import Zone.js in your app

The `zone.js` module needs to be imported before the `rxjs` module runs (i.e. before it's imported for the first time).
There are multiple ways in which it can be accomplished.
Two most straightforward ones are listed below.

### 2.a. Import in installModule

This approach involves overriding the `installModule` path in the plugin configuration and importing `zone.js` there.
The good part here is that the `zone.js` will only be loaded when the RxJS Insights plugin is applied (so hopefully only in development mode).

```js
// install.js

import "zone.js";
import "@rxjs-insights/rxjs7";
```

```js
// development.webpack.config.js

new RxjsInsightsPlugin({installModule: require('path').join(__dirname, 'install.js')});
```

### 2.b. Import in polyfills.js

The `polyfills.js` file is technically a good place to add the `zone.js` import because it's run before the application main module (so before the `rxjs` is imported).
The downside of this approach is that without additional steps the `zone.js` will stay in the production bundle as well.

```js
// polyfills.js

import "zone.js"
```
