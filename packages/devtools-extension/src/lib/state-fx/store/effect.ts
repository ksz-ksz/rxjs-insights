import { Actions, actionsComponent } from './actions';
import { catchError, merge, Observable, throwError } from 'rxjs';
import { Action, ComponentRef } from '@lib/state-fx/store';
import { Component, Container, InitializedComponent } from './container';

export interface Effect {
  dispose(): void;
}

export interface EffectInitializer<TDeps> {
  (actions: Actions, deps: TDeps): Observable<Action<any>>;
}

export type EffectInitializers<TDeps> =
  | Record<string, EffectInitializer<TDeps>>
  | Array<EffectInitializer<TDeps>>;

export type Components<T> = {
  [K in keyof T]: Component<T[K]>;
};

export interface CreateEffectOptions<TDeps> {
  namespace: string;
  deps?: Components<TDeps>;
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

export function createEffectInstance<TDeps>(
  namespace: string,
  actions: Actions,
  deps: TDeps,
  initializers: EffectInitializers<TDeps>
): Effect {
  const subscription = merge(
    ...Object.entries(initializers).map(([key, initializer]) =>
      initializer(actions, deps).pipe(
        catchError((e) => throwError(() => new EffectError(namespace, key, e)))
      )
    )
  ).subscribe({
    next(action) {
      actions.dispatch(action);
    },
    // TODO: observeOn(queue)?
    // TODO: error, complete?
  });

  return {
    dispose() {
      subscription.unsubscribe();
    },
  };
}

function useDeps<TDeps>(
  container: Container,
  depsComponents: Components<TDeps>
): { deps: TDeps; depsHandles: ComponentRef<unknown>[] } {
  const depsHandles: ComponentRef<unknown>[] = [];
  const deps: Record<string, unknown> = {};

  for (const [key, dep] of Object.entries<Component<unknown>>(depsComponents)) {
    const depHandle = container.use(dep);
    deps[key] = depHandle.component;
    depsHandles.push(depHandle);
  }

  return {
    deps: deps as TDeps,
    depsHandles,
  };
}

function createEffectComponent<TDeps>(
  namespace: string,
  depsComponents: Components<TDeps>,
  initializers: EffectInitializers<TDeps>
): Component<Effect> {
  return {
    init(container: Container): InitializedComponent<Effect> {
      const actionsHandle = container.use(actionsComponent);
      const { deps, depsHandles } = useDeps(container, depsComponents);

      const actions = actionsHandle.component;

      const effect = createEffectInstance(
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
          for (const depsHandle of depsHandles) {
            depsHandle.release();
          }
        },
      };
    },
  };
}

export function createEffect<TDeps>(
  options: CreateEffectOptions<TDeps>
): (initializers: EffectInitializers<TDeps>) => Component<Effect> {
  const { namespace, deps = {} as Components<TDeps> } = options;
  return (initializers) => createEffectComponent(namespace, deps, initializers);
}
