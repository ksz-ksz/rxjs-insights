# Plugin configuration

## `installModule: string = '@rxjs-insights/rxjs<version>'`

A path to a module that will be used to install the instrumentation.
The `installModule` is guaranteed to run before the `rxjs` module.

The primary job of the `installModule` is to call the `@rxjs-insights/core` `install` function.
It can be done directly, by importing the `install` function and calling it (which allows for specifying a custom `recorder`, `tracer` and `locator`), or indirectly, by importing the default `installModule`, e.g. `@rxjs-insight/rxjs7`.

The secondary job of the `installModule` is to set up the environment for the RxJS Insights, e.g. to install the Zone.js for better tracking of asynchronous actions.

By default, the `installModule` resolves to the `@rxjs-insights/rxjs<version>` module, e.g. for RxJS 7 it will be resolved to `@rxjs-insights/rxjs7`.
