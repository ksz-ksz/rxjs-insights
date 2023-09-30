import { Deps, DepsType } from './deps';
import { Actions, actionsComponent } from './actions';
import { catchError, merge, Observable, of, throwError } from 'rxjs';
import { Action } from '@lib/state-fx/store';
import { Component, Container, InitializedComponent } from './container';
import { createStoreViewComponent, StoreView } from './store-view';

export interface Effect {
  dispose(): void;
}

export interface EffectInitializer<TDepsState> {
  (actions: Actions, depsView: StoreView<TDepsState>): Observable<Action<any>>;
}

export type EffectInitializers<TDepsState> =
  | Record<string, EffectInitializer<TDepsState>>
  | Array<EffectInitializer<TDepsState>>;

export interface CreateEffectOptions<TDeps extends Deps> {
  namespace: string;
  deps?: TDeps;
}

function createEmptyStoreView(): StoreView<any> {
  const state = {};

  return {
    actionSources: [],
    getState() {
      return state;
    },
    getStateObservable() {
      return of(state);
    },
    dispose() {},
  };
}

function createDepsComponent(actions: Actions, deps: StoreView<any>[]) {
  switch (deps.length) {
    case 0:
      return createEmptyStoreView();
    case 1:
      return deps[0];
    default:
      return createStoreViewComponent(actions, deps);
  }
}

export class EffectError extends Error {
  constructor(
    readonly namespace: string,
    readonly key: string,
    readonly cause: any
  ) {
    super(`Error in ${namespace}::${key}`);
  }
}

function createEffectComponent(
  namespace: string,
  actions: Actions,
  deps: StoreView<any>[],
  initializers: EffectInitializers<any>
): Effect {
  const depsView = createDepsComponent(actions, deps);
  const subscription = merge(
    ...Object.entries(initializers).map(([key, initializer]) =>
      initializer(actions, depsView).pipe(
        catchError((e) => throwError(() => new EffectError(namespace, key, e)))
      )
    )
  ).subscribe({
    next(action) {
      actions.dispatch(action);
    },
    // TODO: error, complete?
  });

  return {
    dispose() {
      subscription.unsubscribe();
    },
  };
}

class EffectComponent implements Component<Effect> {
  constructor(
    private readonly namespace: string,
    private readonly deps: Deps,
    private readonly initializers: EffectInitializers<any>
  ) {}

  init(container: Container): InitializedComponent<Effect> {
    const { namespace, initializers } = this;
    const actionsHandle = container.use(actionsComponent);
    const depsHandles = this.deps.map((dep) => container.use(dep));

    const actions = actionsHandle.component;
    const deps = depsHandles.map((depHandle) => depHandle.component);

    const effect = createEffectComponent(
      namespace,
      actions,
      deps,
      initializers
    );

    return {
      component: effect,
      dispose() {
        effect.dispose();
        actionsHandle.release();
        for (let depsHandle of depsHandles) {
          depsHandle.release();
        }
      },
    };
  }
}

export function createEffect<TDeps extends Deps = []>(
  options: CreateEffectOptions<TDeps>
): (initializers: EffectInitializers<DepsType<TDeps>>) => Component<Effect> {
  const { namespace, deps = [] } = options;
  return (initializers) => new EffectComponent(namespace, deps, initializers);
}
