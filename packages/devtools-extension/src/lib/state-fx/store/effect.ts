import { Actions, actionsComponent } from './actions';
import { catchError, merge, Observable, throwError } from 'rxjs';
import {
  Action,
  Components,
  createComponent,
  createComponents,
} from '@lib/state-fx/store';
import { EffectError } from './effect-error';
import { Disposable } from './disposable';

export interface Effect extends Disposable {}

export interface EffectInitializer {
  (actions: Actions): Observable<Action<any>>;
}

export type EffectInitializers =
  | Record<string, EffectInitializer>
  | Array<EffectInitializer>;

export function createEffect(actions: Actions, def: EffectDef): Effect {
  const { name, effects } = def;
  const subscription = merge(
    ...Object.entries(effects).map(([key, initializer]) =>
      initializer(actions).pipe(
        catchError((e) => throwError(() => new EffectError(name, key, e)))
      )
    )
  ).subscribe({
    next(action) {
      actions.dispatch(action);
    },
    error(error) {
      queueMicrotask(() => {
        throw new EffectError(name, '*', error);
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

export interface EffectDef {
  name: string;
  effects: EffectInitializers;
}

export function createEffectComponent<TDeps>(
  createEffectDef: (deps: TDeps) => EffectDef,
  deps: Components<TDeps> = {} as Components<TDeps>
) {
  return createComponent(
    ({ actions, deps }) => createEffect(actions, createEffectDef(deps)),
    {
      deps: { actions: actionsComponent, deps: createComponents(deps) },
      dispose(effect) {
        effect.dispose();
      },
    }
  );
}
