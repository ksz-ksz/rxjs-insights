# RxJS Insights

A toolset that helps to understand what's going on in the RxJS Observables.
By instrumenting the RxJS constructors, operators, and the subscribe method, it gathers the following data:

* constructor, creator and operator function calls,
* observables and subjects,
* subscriptions and their dependencies,
* notifications, subscribes and unsubscribes and their dependencies.

## Instrumentation

To enable the instrumentation in your app, follow the instructions specific for your version of the RxJS:
* [RxJS 6](./packages/rxjs6/README.md),
* [RxJS 7](./packages/rxjs7/README.md).

## Inspection

To visualize collected data, follow the instructions from the [Console Inspector](./packages/console/README.md).

## Future work

* Make it easier to setup the instrumentation.
* Create a devtools extension.

