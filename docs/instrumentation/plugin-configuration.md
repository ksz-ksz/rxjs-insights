# Plugin configuration

## `installModule: string = '@rxjs-insights/rxjs<version>'`

A path to a module that will be used to install the instrumentation.
The `installModule` is guaranteed to run before the `rxjs` module.

The primary job of the `installModule` is to call the `@rxjs-insights/core` `install` function.
It can be done directly, by importing the `install` function and calling it (which allows for specifying a custom `recorder`, `tracer` and `locator`), or indirectly, by importing the default `installModule`, e.g. `@rxjs-insight/rxjs7`.

The secondary job of the `installModule` is to set up the environment for the RxJS Insights, e.g. to install Zone.js for better async actions tracking.

By default, the `installMoule` resolves to the `@rxjs-insights/rxjs<version>` module, e.g. for RxJS 7 it will be `@rxjs-insights/rxjs7`.

## `installMode: 'automatic' | 'conditional' = 'automatic'`

A property that will be used to determine whether the instrumentation should be installed automatically or conditionally.

If set to `automatic`, the instrumentation will be installed unconditionally (i.e. as soon as the `installModule` runs).

If set to `conditional`, the instrumentation will be installed only if the `RXJS_INSIGHTS_INSTALL` global variable is set.
This is useful if you do not want to always enable instrumentation (which comes with a performance and memory cost) and do it only when the DevTools are active.
