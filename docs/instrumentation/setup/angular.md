# Angular setup

Angular is using Webpack under the hood.
The instruction below will guide you through setting up the [custom builders](https://github.com/just-jeb/angular-builders#readme) from the `@angular-builders/custom-webpack` package, which will allow you to add the Webpack plugin to your development build configuration (i.e. it will be active only when using the `ng serve`).

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
> For example, if you are using Angular 11 (which by default uses Webpack 4), you need to run `npm install --save-dev @rxjs-insights/plugin-webpack4`.

## 3. Install the custom builders package

```
npm install --save-dev @angular-builders/custom-webpack
```

> Note: The version of the `@angular-builders/custom-webpack` package needs to match the version of Angular.
> For example, if you are using Angular 12, you need to run `npm install --save-dev @angular-builders/custom-webpack@^12`.

## 4. Create a custom webpack config in the `development.config.js` file

* Place it next to the `angular.json` file.
* Set its content to:
```js
const { RxjsInsightsPlugin } = require('@rxjs-insights/plugin-webpack5');

module.exports = {
  plugins: [
    new RxjsInsightsPlugin()
  ]
}
```

> Note: If you installed e.g. `@rxjs-insights/plugin-webpack4` package, you'll need to adjust the `require` path accordingly.

## 5. Replace the default builders with custom builders in the `angular.json`

* Set the `projects.<project>.architect.serve.builder` property value to `@angular-builders/custom-webpack:dev-server`.
* Set the `projects.<project>.architect.build.builder` property value to `@angular-builders/custom-webpack:browser`.
* Set the `projects.<project>.architect.build.configurations.development.customWebpackConfig` property value to `{ "path": "development.config.js" }`.
