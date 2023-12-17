import { Fn } from './fn';
import {
  Component,
  createDeps,
  Deps,
  InitializedComponent,
  StoreComponent,
} from '../store';
import { ResourceActionTypes } from './resource-actions';
import { ResourceState } from './resource-store';
import { QueriesDef } from './queries';
import { createQueryEffect } from './query-effect';
import { MutationsDef } from './mutations';
import { createMutationEffect } from './mutation-effect';

export function createResourceEffect<
  TQueries extends { [key: string]: Fn },
  TMutations extends { [key: string]: Fn },
  TDeps
>(
  options: {
    namespace: string;
    store: StoreComponent<ResourceState>;
    actions: ResourceActionTypes;
    deps?: Deps<TDeps>;
  },
  defs: {
    queries?: QueriesDef<TQueries, TDeps>;
    mutations?: MutationsDef<TMutations, TDeps>;
  }
) {
  const { queries, mutations } = defs;
  const {
    namespace,
    deps = {} as Deps<TDeps>,
    actions: resourceActions,
    store: resourceStore,
  } = options;

  return createDeps({
    queries:
      queries !== undefined
        ? createQueryEffect(
            namespace,
            queries,
            resourceActions,
            resourceStore,
            deps
          )
        : createEmpty(),
    mutations:
      mutations !== undefined
        ? createMutationEffect(
            namespace,
            mutations,
            resourceActions,
            resourceStore,
            deps
          )
        : createEmpty(),
  });
}

function createEmpty(): Component<void> {
  return {
    init(): InitializedComponent<void> {
      return {
        component: undefined,
      };
    },
  };
}
