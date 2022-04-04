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

![Example console output](./docs/console/usage/events-flow.png)

## Documentation

* [Instrumentation](./docs/instrumentation/index.md)
  * [Setup](./docs/instrumentation/setup/index.md)
    * [Angular](./docs/instrumentation/setup/angular.md)
    * [Webpack](./docs/instrumentation/setup/webpack.md)
    * [ESBuild](./docs/instrumentation/setup/esbuild.md)
    * [Other build systems](./docs/instrumentation/setup/others.md)
  * [Plugin configuration](./docs/instrumentation/plugin-configuration.md)
  * [Async actions tracking](./docs/instrumentation/async-actions-tracking.md)
* [Console](./docs/console/index.md)
  * [Setup](./docs/console/setup.md)
  * [Usage](./docs/console/usage/index.md)
    * [inspect](./docs/console/usage/info.md)
    * [inspectSubscribers](./docs/console/usage/subscribers.md)
    * [inspectSources](./docs/console/usage/sources.md)
    * [inspectDestinations](./docs/console/usage/destinations.md)
    * [inspectEvents](./docs/console/usage/events.md)
    * [inspectPrecedingEvents](./docs/console/usage/preceding-events.md)
    * [inspectSucceedingEvents](./docs/console/usage/succeeding-events.md)
    * [inspectEventsFlow](./docs/console/usage/events-flow.md)

## Future work

* 🧩 Create plugins for other bundlers (e.g. Rollup, Parcel, etc.), 
* 🧩 Create a DevTools extension! 😎


