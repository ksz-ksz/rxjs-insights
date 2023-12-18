import { Actions, actionsComponent } from './actions';
import { catchError, merge, Observable, throwError } from 'rxjs';
import { Action } from '@lib/state-fx/store';
import { Component, Container, ComponentInstance } from './container';
import { Deps, useDeps } from './deps';

export interface Effect {
  dispose(): void;
}

export interface EffectInitializer<TDeps> {
  (actions: Actions, deps: TDeps): Observable<Action<any>>;
}

export type EffectInitializers<TDeps> =
  | Record<string, EffectInitializer<TDeps>>
  | Array<EffectInitializer<TDeps>>;

export interface CreateEffectOptions<TDeps> {
  namespace: string;
  deps?: Deps<TDeps>;
}

export class EffectError extends Error {
  readonly name = 'EffectError';
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
    error(error) {
      queueMicrotask(() => {
        throw new EffectError(namespace, '*', error);
      });
    },
    // TODO: complete?
    // TODO: observeOn(queue)?
  });

  return {
    dispose() {
      subscription.unsubscribe();
    },
  };
}

function createEffectComponent<TDeps>(
  namespace: string,
  depsComponents: Deps<TDeps>,
  initializers: EffectInitializers<TDeps>
): Component<Effect> {
  return {
    init(container: Container): ComponentInstance<Effect> {
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
  const { namespace, deps = {} as Deps<TDeps> } = options;
  return (initializers) => createEffectComponent(namespace, deps, initializers);
}
