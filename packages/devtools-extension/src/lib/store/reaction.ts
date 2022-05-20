import { merge, Observable } from 'rxjs';
import { Action } from './action';
import { Store } from './store';

export interface Reaction<REQUIRED_STATE = {}, DEPS = void> {
  react(action$: Observable<Action>, deps: DEPS): Observable<Action>;
  deps?(store: Store<REQUIRED_STATE>): DEPS;
}

export function createReaction(
  react: (action$: Observable<Action>) => Observable<Action>
): Reaction;
export function createReaction<REQUIRED_STATE, DEPS>(
  react: (action$: Observable<Action>, deps: DEPS) => Observable<Action>,
  deps: (store: Store<REQUIRED_STATE>) => DEPS
): Reaction<REQUIRED_STATE, DEPS>;
export function createReaction(
  react: (action$: Observable<Action>, deps: any) => Observable<Action>,
  deps?: (store: Store<any>) => any
) {
  return {
    react,
    deps,
  };
}

export class ReactionsCombinator<REQUIRED_STATE = {}>
  implements Reaction<REQUIRED_STATE, Store<REQUIRED_STATE>>
{
  readonly reactions: Reaction<REQUIRED_STATE, any>[] = [];

  react(
    action$: Observable<Action>,
    store: Store<REQUIRED_STATE>
  ): Observable<Action> {
    return merge(
      ...this.reactions.map((reaction) =>
        reaction.react(action$, reaction.deps?.(store))
      )
    );
  }

  deps(store: Store<REQUIRED_STATE>): Store<REQUIRED_STATE> {
    return store;
  }

  add<REACTION_REQUIRED_STATE>(
    reaction: Reaction<REACTION_REQUIRED_STATE, any>
  ): ReactionsCombinator<REQUIRED_STATE & REACTION_REQUIRED_STATE> {
    this.reactions.push(reaction as any);
    return this as any;
  }

  asReaction(): Reaction<REQUIRED_STATE, Store<REQUIRED_STATE>> {
    return this;
  }
}

export function combineReactions(): ReactionsCombinator {
  return new ReactionsCombinator();
}
