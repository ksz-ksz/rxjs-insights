import { catchError, merge, Observable } from 'rxjs';
import { Action } from './actions';
import { Store } from './store';

export interface EffectFunction<TStoreState> {
  (action: Observable<Action<any>>, store: Store<TStoreState>): Observable<
    Action<any>
  >;
}

export interface Effect<TStoreState> {
  run(
    action: Observable<Action<any>>,
    store: Store<TStoreState>
  ): Observable<Action<any>>;
}

export interface Effects<TStoreState> {
  [name: string]: EffectFunction<TStoreState>;
}

export interface CreateEffectOptions<TStoreState> {
  namespace: string;
  storeState?: TStoreState;
  effects: Effects<TStoreState>;
}

export class EffectError extends Error {
  constructor(
    readonly namespace: string,
    readonly name: string,
    readonly cause: any
  ) {
    super(`Error in effect "${namespace}::${name}"`, { cause });
  }
}

export function createEffect<TStoreState>({
  namespace,
  effects,
}: CreateEffectOptions<TStoreState>): Effect<TStoreState> {
  return {
    run(
      action: Observable<Action<any>>,
      store: Store<TStoreState>
    ): Observable<Action<any>> {
      return merge(
        ...Object.entries(effects).map(([name, effect]) =>
          effect(action, store).pipe(
            catchError((err) => {
              throw new EffectError(namespace, name, err);
            })
          )
        )
      );
    },
  };
}
