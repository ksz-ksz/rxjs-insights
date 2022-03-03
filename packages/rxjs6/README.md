# RxJS Insights for RxJS v6

A toolset that helps to understand what's going on in the RxJS Observables.
By instrumenting the RxJS constructors, operators, and the subscribe method, it gathers the following data:

* constructor, creator and operator function calls,
* observables and subjects,
* subscriptions and their dependencies,
* notifications, subscribes and unsubscribes and their dependencies.

## About this package

This package aims to simplify the process of setting up the RxJS 6 creators and operators.
The idea is to replace the `rxjs` and `rxjs/operators` imports with the `@rxjs-insights` alias that wraps the RxJS' constructors and operators with the instrumentation function calls and then to enable the instrumentation.
To set up module aliasing, a build process based on e.g. Webpack or ESBuild is needed.
In theory, it should be safe to leave the aliases in the production code (they are tree shaking friendly and are basically noops unless the instrumentation is enabled), however, do it on your own risk.

If you do not have a build process in place or cannot set up module aliasing for whatever reason, consider using the `@rxjs-insights/instrumentation` package directly.

## Usage

### Install deps

```
npm install @rxjs-insights/rxjs6 --save-dev
```

### Set up module aliases

The goal is to set up the aliases as follows:
* `@rxjs-insights/rxjs-alias` should resolve to `rxjs`,
* `@rxjs-insights/rxjs-alias/operators` should resolve to `rxjs/operators`,
* `rxjs` should resolve to `@rxjs-insights/rxjs6/rxjs`,
* `rxjs/operators` should resolve to `@rxjs-insights/rxjs6/rxjs/operators`.

Setting up module aliases looks different in different build processes.

#### Typescript

If your build process supports Typescript's path mapping resolution (e.g. Angular and ESBuild does), setting up aliases is as simple as adding the following to the `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@rxjs-insights/rxjs-alias": ["node_modules/rxjs"],
      "@rxjs-insights/rxjs-alias/operators": ["node_modules/rxjs/operators"],
      "rxjs": ["node_modules/@rxjs-insights/rxjs6/rxjs"],
      "rxjs/operators": ["node_modules/@rxjs-insights/rxjs6/rxjs/operators"]
    }
  }
}
```

The configuration above assumes that the `node_modules` directory is located next to the `tsconfig.json` file.
If it's not the case for you, adjust the paths accordingly (note the `node_modules` prefix).

#### Webpack

To be done.

#### ESBuild

To be done.

### Enable instrumentation

The trick is to enable the instrumentation before the `rxjs` and `rxjs/operators` modules execute.
In some scenarios it might be tricky as it depends on the imports order.
The recommended approach is to create a new file where the instrumentation will be enabled and import it (as a first import) in the main entry point of the application:

```ts
// install.ts
import { install } from '@rxjs-insights/rxjs6';
install();
```

```ts
// main.ts
import './install';
(<other imports>);

(<code>);
```

> Note for Angular users: the Angular compiler tends to mangle the imports order in files where the `@angular/platform-browser-dynamic` is imported.
> It's best to avoid importing the `./install` module in those files.

