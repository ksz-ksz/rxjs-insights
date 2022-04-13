import { Observable } from 'rxjs';
import { Action } from './action';
import { Store } from './store';

export interface Reaction<STATE = {}, DEPS = void> {
  react(action$: Observable<Action>, deps: DEPS): Observable<Action>;
  deps?(store: Store<STATE>): DEPS;
}

export function createReaction(
  react: (action$: Observable<Action>) => Observable<Action>
): Reaction;
export function createReaction<STATE, DEPS>(
  react: (action$: Observable<Action>, deps: DEPS) => Observable<Action>,
  deps: (store: Store<STATE>) => DEPS
): Reaction<STATE, DEPS>;
export function createReaction(
  react: (action$: Observable<Action>, deps: any) => Observable<Action>,
  deps?: (store: Store<any>) => any
) {
  return {
    react,
    deps,
  };
}
