import { ActionSource } from './action-source';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { Component, Container, InitializedComponent } from './container';
import { Deps, DepsState, getDepsState } from './deps';
import { Actions, actionsComponent } from './actions';
import { StoreComponent } from './store';

export interface StoreView<T> {
  readonly actionSources: ActionSource<any>[];

  getState(): T;

  getStateObservable(): Observable<T>;

  dispose(): void;
}

export interface CreateStoreViewOptions<TDeps extends Deps> {
  deps: [...TDeps];
}

export function createStoreView<TDeps extends Deps>(
  options: CreateStoreViewOptions<TDeps>
): StoreViewComponent<DepsState<TDeps>> {
  return new StoreViewComponent(options.deps);
}

function getActionSources(deps: StoreView<any>[]) {
  return Array.from(new Set(deps.flatMap((dep) => dep.actionSources)));
}

export function createStoreViewComponent(
  actions: Actions,
  deps: StoreView<any>[]
): StoreView<any> {
  const actionSources = getActionSources(deps);

  const stateSubject = new BehaviorSubject(getDepsState(deps));

  const subscription = merge(...actionSources).subscribe({
    next() {
      stateSubject.next(getDepsState(deps));
    },
  });

  return {
    actionSources,
    getState() {
      return stateSubject.getValue();
    },
    getStateObservable() {
      return stateSubject.asObservable();
    },
    dispose() {
      subscription.unsubscribe();
    },
  };
}

class StoreViewComponent<T> implements Component<StoreView<T>> {
  constructor(private readonly deps: Deps) {}

  init(container: Container): InitializedComponent<StoreView<T>> {
    const actionsHandle = container.use(actionsComponent);
    const depsHandles = this.deps.map((dep) => container.use(dep));

    const actions = actionsHandle.component;
    const deps = depsHandles.map((depHandle) => depHandle.component);

    const storeView = createStoreViewComponent(actions, deps);

    return {
      component: storeView,
      dispose() {
        storeView.dispose();
        actionsHandle.release();
        for (let depsHandle of depsHandles) {
          depsHandle.release();
        }
      },
    };
  }
}

export type StoreViewState<TStoreView extends StoreViewComponent<any>> =
  TStoreView extends StoreViewComponent<infer TState> ? TState : never;

// TODO: rename: createStatesComposition, createComposition, StateContainer, State
