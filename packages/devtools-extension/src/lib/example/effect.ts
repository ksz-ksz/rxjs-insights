import { Deps, MergeDeps } from './deps';
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

function createDepsComponent(
  actions: Actions,
  depStoreViews: StoreView<any>[]
) {
  switch (depStoreViews.length) {
    case 0:
      return createEmptyStoreView();
    case 1:
      return depStoreViews[0];
    default:
      return createStoreViewComponent(actions, depStoreViews);
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

function createEffectInstance(
  namespace: string,
  actions: Actions,
  depStoreViews: StoreView<any>[],
  initializers: EffectInitializers<any>
): Effect {
  const depsView = createDepsComponent(actions, depStoreViews);
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

function createEffectComponent(
  namespace: string,
  deps: Deps,
  initializers: EffectInitializers<any>
): Component<Effect> {
  return {
    init(container: Container): InitializedComponent<Effect> {
      const actionsHandle = container.use(actionsComponent);
      const depsHandles = deps.map((dep) => container.use(dep));

      const actions = actionsHandle.component;
      const depStoreViews = depsHandles.map((depHandle) => depHandle.component);

      const effect = createEffectInstance(
        namespace,
        actions,
        depStoreViews,
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
    },
  };
}

export function createEffect<TDeps extends Deps = []>(
  options: CreateEffectOptions<TDeps>
): (initializers: EffectInitializers<MergeDeps<TDeps>>) => Component<Effect> {
  const { namespace, deps = [] } = options;
  return (initializers) => createEffectComponent(namespace, deps, initializers);
}
