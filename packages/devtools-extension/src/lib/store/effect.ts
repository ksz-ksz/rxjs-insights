import { Observable } from 'rxjs';
import { Command } from './command';
import { Store } from './store';

export interface Effect<STATE, DEPS> {
  effect(
    command$: Observable<Command<any>>,
    deps: DEPS
  ): Observable<Command<any>>;
  deps(store: Store<STATE>): DEPS;
}

export function createEffect<STATE>(
  effect: (command$: Observable<Command<any>>) => Observable<Command<any>>
): Effect<STATE, void>;
export function createEffect<STATE, DEPS>(
  effect: (
    command$: Observable<Command<any>>,
    deps: DEPS
  ) => Observable<Command<any>>,
  deps: (store: Store<STATE>) => DEPS
): Effect<STATE, DEPS>;
export function createEffect(
  effect: (
    command$: Observable<Command<any>>,
    deps: any
  ) => Observable<Command<any>>,
  deps?: (store: Store<any>) => any
) {
  return {
    effect,
    deps,
  };
}
