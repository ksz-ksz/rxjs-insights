# RxJS Insights

[![npm version](https://badge.fury.io/js/@rxjs-insights%2Finstrumentation.svg)](https://badge.fury.io/js/@rxjs-insights%2Fcore)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ksz-ksz/rxjs-insights/blob/master/LICENSE)

RxJS Insights is a toolset that helps you debug the RxJS Observables.

**✨ Developer friendly**: Easy to setup. Easy to use.

**✨ Comprehensive**: Collects all types of events that happen inside RxJS.

**✨ Unobtrusive**: Does not require source code modification to be useful.

RxJS Insights gathers the data about:

* **constructors** (e.g. `Observable`, `Subject`, etc.),
* **creators** (e.g. `of`, `interval`, etc.),
* **operators** (e.g. `map`, `delay`, etc.),
* **subscribers**,
* **subscriber chains** (i.e. subscribers created by other subscribers),
* **events**:
  * **notification events** (i.e. `next`, `error` and `complete`),
  * **subscription events** (i.e. `subscribe` and `unsubscribe`),
* **event relations** (i.e. events caused by other events),
* **async tasks**: (e.g. `setTimeout`, `setInterval`, DOM events, REST events, etc.).

**Try it out on [StackBlitz ⚡](https://stackblitz.com/edit/rxjs-insights-playground)**

![Example console output](./docs/console/img/events-flow.png)

## Documentation

* [Instrumentation](./docs/instrumentation/index.md)
  * [Setup](./docs/instrumentation/setup/index.md)
    * [Angular](./docs/instrumentation/setup/angular.md)
    * [Webpack](./docs/instrumentation/setup/webpack.md)
    * [ESBuild](./docs/instrumentation/setup/esbuild.md)
    * [Other build systems](./docs/instrumentation/setup/others.md)
  * [Customization](./docs/instrumentation/customization.md)
    * [Declarations](./docs/instrumentation/customization.md#declarations)
    * [Decorators](./docs/instrumentation/customization.md#decorators)
    * [Operators](./docs/instrumentation/customization.md#operators)
  * [Plugin configuration](./docs/instrumentation/plugin-configuration.md)
  * [Async actions tracking](./docs/instrumentation/async-actions-tracking.md)
* [Console](./docs/console/index.md)
  * [Setup](./docs/console/setup.md)
  * [Usage](./docs/console/usage.md)
    * [Interactive output](./docs/console/usage.md#interactive-output)
    * [Inspections](./docs/console/usage.md#inspections)

## Future work

* 🧩 Create plugins for other bundlers (e.g. Rollup, Parcel, etc.), 
* 🧩 Create a DevTools extension! 😎


