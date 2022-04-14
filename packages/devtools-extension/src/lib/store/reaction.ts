import { merge, Observable } from 'rxjs';
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

export class ReactionsCombinator<STATE = {}>
  implements Reaction<STATE, Store<STATE>>
{
  readonly reactions: Reaction<STATE, any>[] = [];

  react(action$: Observable<Action>, store: Store<STATE>): Observable<Action> {
    return merge(
      ...this.reactions.map((reaction) =>
        reaction.react(action$, reaction.deps?.(store))
      )
    );
  }

  deps(store: Store<STATE>): Store<STATE> {
    return store;
  }

  add<REACTION_STATE>(
    reaction: Reaction<REACTION_STATE, any>
  ): ReactionsCombinator<STATE & REACTION_STATE> {
    this.reactions.push(reaction as any);
    return this as any;
  }

  asReaction(): Reaction<STATE, Store<STATE>> {
    return this;
  }
}

export function combineReactions(): ReactionsCombinator {
  return new ReactionsCombinator();
}
