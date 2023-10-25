import { SuperSelector } from './super-selector';
import { Observable, Observer } from 'rxjs';
import { Component } from './container';
import { Store } from './store';
import { createSelectorFunction, StateSelectorFunction } from './selector';

export class Selection<TArgs extends any[], TResult> extends Observable<void> {
  private readonly fn: StateSelectorFunction<any, TArgs, TResult>;
  constructor(
    private readonly selector: SuperSelector<any, any, any>,
    private readonly deps: Store<any>[]
  ) {
    super((subscriber) => {
      const observer: Observer<void> = {
        next() {
          subscriber.next(undefined);
        },
        error(err) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      };
      for (const dep of this.deps) {
        subscriber.add(dep.getStateObservable().subscribe(observer));
      }
    });
    this.fn = createSelectorFunction(selector);
  }

  getResult(...args: TArgs) {
    const state = getState(this.selector, this.deps);
    return this.fn(state, ...args);
  }
}

function getState(selector: SuperSelector<any, any, any>, deps: Store<any>[]) {
  const map = new Map<Component<Store<any>>, any>();

  const n = deps.length;

  for (let i = 0; i < n; i++) {
    const storeComponent = selector.deps[i];
    const store = deps[i];

    map.set(storeComponent, store.getState());
  }

  return map;
}

function createSelectionInstance<TArgs extends any[], TResult>(
  selector: SuperSelector<any, TArgs, TResult>,
  deps: Store<any>[]
): Selection<TArgs, TResult> {
  return new Selection<TArgs, TResult>(selector, deps);
}

function createSelectionComponent<TArgs extends any[], TResult>(
  selector: SuperSelector<any, TArgs, TResult>
): Component<Selection<TArgs, TResult>> {
  return {
    init(container) {
      const depsHandles = selector.deps.map((dep) => container.use(dep));
      const deps = depsHandles.map((depHandle) => depHandle.component);

      const selection = createSelectionInstance(selector, deps);

      return {
        component: selection,
        dispose() {
          for (const depHandle of depsHandles) {
            depHandle.release();
          }
        },
      };
    },
  };
}

export function createSelection<TArgs extends any[], TResult>(
  selector: SuperSelector<any, TArgs, TResult>
) {
  return createSelectionComponent(selector);
}
