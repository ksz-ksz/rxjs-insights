<p align="center">
  <a href="https://badge.fury.io/js/@rxjs-insights%2Fcore">
    <img src="https://badge.fury.io/js/@rxjs-insights%2Fcore.svg" alt="npm version">
  </a>
  <a href="https://github.com/ksz-ksz/rxjs-insights/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" />
  </a>
</p>

<p align="center"><img src="./resources/rxjs-insights.svg" width="256px" alt="RxJS Insights"/></p>

<h1 align="center">RxJS Insights</h1>

RxJS Insights is a toolset that helps you debug and visualize the observables in your app.

**✨ Developer friendly**: Easy to set up. Easy to use.

**✨ Unobtrusive**: Does not require source code changes in order to identify observables.

**✨ Comprehensive**: Tracks all types of observable events and relations.

The data gathered by the RxJS Insights includes the information about:

* **constructor** calls, including the arguments passed to it, the name of the Observable (sub)class, and the source code location of the call,
* **creation operator** calls, including the arguments passed to it, the name of the operator, and the source code location of the call,
* **pipeable operator** calls, including the arguments passed to it, the name of the operator, and the source code location of the call,
* **subscribers** (i.e. the instances of the running observables), including the relation to the parent observable, as well as relations to other subscribers that are either sources or destinations of the given subscriber,
* **callers** (i.e. the connection with the world outside the RxJS, e.g. direct `subscribe` or `lastValueFrom` calls from the application), including the arguments passed to it, and the source code location of the call,
* **events**, including the **notification events** (i.e. `next`, `error`, and `complete`) and **subscription events** (i.e. `subscribe` and `unsubscribe`), as well as relations to other events that either caused or are caused by the given event,
* **async tasks** within which the events happened (e.g. `setTimeout`, `setInterval`, DOM events, REST events, etc.).

**Try it out on [StackBlitz ⚡](https://stackblitz.com/edit/rxjs-insights-playground?file=src%2Findex.ts)**

![Example console output](./resources/rxjs-insights.gif)

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
* [Devtools](./docs/devtools/index.md)
  * [Setup](./docs/devtools/setup.md)
  * [Usage](./docs/devtools/usage.md)
    * [Inspecting observables and subscribers](./docs/devtools/usage.md#inspecting-observables-and-subscribers)
    * [RxJS Insights Devtools Sources Panel Extension](./docs/devtools/usage.md#using-the-rxjs-insights-devtools-sources-panel-extension)
    * [RxJS Insights Devtools Panel](./docs/devtools/usage.md#using-the-rxjs-insights-devtools-panel)
* [Console](./docs/console/index.md)
  * [Setup](./docs/console/setup.md)
  * [Usage](./docs/console/usage.md)
    * [Interactive output](./docs/console/usage.md#interactive-output)
    * [Inspections](./docs/console/usage.md#inspections)

## Future work

* 🧩 Create plugins for other bundlers (e.g. Rollup, Parcel, etc.), 
* 🧩 Add more visualization options (e.g. marble diagrams),
* 🧩 Allow for better customization.
