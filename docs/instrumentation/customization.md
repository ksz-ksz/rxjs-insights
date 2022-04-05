# Customization

By default, RxJS Insights instruments built-in RxJS constructors, creators and operators.
Instrumentation, while completely optional, has many advantages, including:
* simplified Observable identification by assigning it a custom name and/or tag,
* discovery of the source code locations pointing to the instrumented function usages,
* discovery of the arguments passed to the instrumented function.



The customization utilities can be divided into two categories:
* **naming utilities** - they set the name of the observable (an observable can have only one name) and binds the source code location to the usage of the instrumented constructor, creator or operator,
* **tagging utilities** - they add a tag to the observable (an observable can have multiple tags) without altering its name and source code location binding. They are useful if you want to keep track of an observable between function calls.

> Note: It's safe to keep the customization utilities in the production code. They have only a minimal memory and performance footprint if the instrumentation is not enabled.

## Declarations

### `declareConstructor(constructor: Function, name?: string)`

> Note: This function is typically not needed as all subclasses of the `Observable` class are properly tracked by default.
> However, you may still want to use it to customize the automatically discovered class name.

Naming utility. Instruments an observable constructor (class), e.g.:

```ts
import { Observable } from "rxjs";
import { declareConstructor } from "@rxjs-insights/core/declarations";

class _CustomObservable extends Observable<any> {}

export const CustomObservable = declareConstructor(_CustomObservable, "CustomObservable");
export type CustomObservable = _CustomObservable;
```

### `declareCreator(creator: Function, name?: string)`

Naming utility. Instruments an observable creator function, e.g.:

```ts
import { Observable } from "rxjs";
import { declareCreator } from "@rxjs-insights/core/declarations";

function _customCreator() {
  return new Observable();
}

export const customCreator = declareCreator(_customCreator, "customCreator");
```

### `declareOperator(operator: Function, name?: string)`

Naming utility. Instruments an observable operator function, e.g.:

```ts
import { Observable } from "rxjs";
import { declareOperator } from "@rxjs-insights/core/declarations";

function _customOperator() {
  return (source: Observable<any>) => new Observable((observer) => source.subscribe(observer));
}

export const customOperator = declareOperator(_customOperator, "customOperator");
```

### `declareSingleton(observable: Observable<any>, name?: string)`

Naming utility. Instruments an observable, e.g.:

```ts
import { Observable } from "rxjs";
import { declareSingleton } from "@rxjs-insights/core/declarations";

const _CUSTOM_OBSERVABLE = new Observable();

export const CUSTOM_OBSERVABLE = declareSingleton(_CUSTOM_OBSERVABLE, "CUSTOM_OBSERVABLE");
```

## Decorators

### `ObservableCreator(name? string)`

Naming utility. Instruments an observable creator method, e.g.:

```ts
import { Observable } from "rxjs";
import { ObservableCreator } from "@rxjs-insights/core/decorators";

export class MyClass {
  @ObservableCreator("customCreator")
  customCreator() {
    return new Observable();
  }
}
```

### `ObservableOperator(name? string)`

Naming utility. Instruments an observable operator method, e.g.:

```ts
import { Observable } from "rxjs";
import { ObservableOperator } from "@rxjs-insights/core/decorators";

export class MyClass {
  @ObservableOperator("customOperator")
  customOperator() {
    return (source: Observable<any>) => new Observable((observer) => source.subscribe(observer));
  }
}
```

## Operators

### `tag(name: string)`

Tagging utility. Instruments a piped observable, e.g.:

```ts
import { Observable, of } from "rxjs";
import { tag } from "@rxjs-insights/core/operators";

function a(observable: Observable<any>) {
  return observable.pipe(tag('a'));
}

function b(observable: Observable<any>) {
  return observable.pipe(tag('b'));
}

const observable = a(b(of(1, 2, 3)));
```
