import {
  createSelector,
  CreateSelectorOptions,
  createStateSelector,
  Selector,
  SelectorContextFromDeps,
} from './selector';
import { StoreComponent } from './store';

export interface SuperSelector<TState, TArgs extends any[], TResult>
  extends Selector<TState, TArgs, TResult> {
  deps: StoreComponent<string, any>[];
}

export interface StoreEntry<T> {
  get(store: StoreComponent<string, T>): T;
}

export function createStoreSuperSelector<T>(store: StoreComponent<string, T>) {
  return Object.assign(
    createStateSelector((state: StoreEntry<T>) => state.get(store)),
    {
      deps: [store],
    }
  );
}

function getDeps(selectors: SuperSelector<any, any, any>[]) {
  const deps = new Set<StoreComponent<string, any>>();
  for (const selector of selectors) {
    for (const dep of selector.deps) {
      deps.add(dep);
    }
  }
  return Array.from(deps);
}

export function createSuperSelector<
  TResult,
  TArgs extends any[],
  TDeps extends SuperSelector<any, any, any>[]
>(
  deps: [...TDeps],
  select: (context: SelectorContextFromDeps<TDeps>, ...args: TArgs) => TResult,
  options?: CreateSelectorOptions<TResult>
) {
  return Object.assign(createSelector(select, options), {
    deps: getDeps(deps),
  });
}
