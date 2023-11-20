import { SelectorContext, StoreComponent } from '@lib/state-fx/store';
import { MutationState, QueryState, ResourceState } from './resource-store';
import {
  createStoreSuperSelector,
  createSuperSelector,
  StoreEntry,
  SuperSelector,
} from '../store/super-selector';
import { Fn } from './fn';
import { ResourceKey } from './resource-key';

export interface ResourceSelectors {
  selectResourceState: ((
    context: SelectorContext<StoreEntry<ResourceState>>
  ) => ResourceState) & { deps: StoreComponent<any>[] };
  selectQueryState: (<T extends Fn>(
    context: SelectorContext<StoreEntry<ResourceState>>,
    queryKey: ResourceKey<T>,
    queryArgs: Parameters<T>
  ) => QueryState<ReturnType<T>> | undefined) & { deps: StoreComponent<any>[] };
  selectMutationState: (<T extends Fn>(
    context: SelectorContext<StoreEntry<ResourceState>>,
    mutationKey: ResourceKey<T>,
    mutatorKey: string
  ) => MutationState<ReturnType<T>> | undefined) & {
    deps: StoreComponent<any>[];
  };
}

function createQueryArgsHash(args: any[]): string {
  return '';
}

export function createResourceSelectors(
  store: StoreComponent<ResourceState>
): ResourceSelectors {
  const selectResourceState = createStoreSuperSelector(store);
  const selectQueryState = createSuperSelector(
    [selectResourceState],
    <T extends Fn>(
      ctx: SelectorContext<{
        get(store: StoreComponent<ResourceState>): ResourceState;
      }>,
      queryKey: ResourceKey<T>,
      queryArgs: Parameters<T>
    ): QueryState<ReturnType<T>> | undefined => {
      const resourceState = selectResourceState(ctx);
      return resourceState.queries.find(
        (query) =>
          query.queryKey === queryKey.key &&
          createQueryArgsHash(query.queryArgs) ===
            createQueryArgsHash(queryArgs)
      ) as QueryState<ReturnType<T>> | undefined;
    }
  );
  const selectMutationState = createSuperSelector(
    [selectResourceState],
    <T extends Fn>(
      ctx: SelectorContext<{
        get(store: StoreComponent<ResourceState>): ResourceState;
      }>,
      mutationKey: ResourceKey<T>,
      mutatorKey: string
    ): MutationState<ReturnType<T>> | undefined => {
      const resourceState = selectResourceState(ctx);
      return resourceState.mutations.find(
        (mutataion) =>
          mutataion.mutationKey === mutationKey.key &&
          mutataion.mutatorKey === mutatorKey
      ) as MutationState<ReturnType<T>> | undefined;
    }
  );

  return {
    selectResourceState,
    selectQueryState,
    selectMutationState,
  };
}
