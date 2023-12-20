import { Fn } from './fn';
import {
  Actions,
  actionsComponent,
  Components,
  createComponent,
  createComponents,
  Disposable,
  Store,
  StoreComponent,
} from '../store';
import { ResourceActionTypes } from './resource-actions';
import { ResourceState } from './resource-store';
import { QueriesDef } from './queries';
import { createQueryEffect } from './query-effect';
import { MutationsDef } from './mutations';
import { createMutationEffect } from './mutation-effect';
import { SchedulerLike } from 'rxjs';
import { createQueryActionsEmitter } from './query-actions-emitter';
import { createMutationActionsEmitter } from './mutation-actions-emitter';
import { schedulerComponent } from './scheduler';

export interface ResourceInitializerDef<
  TQueries extends { [key: string]: Fn },
  TMutations extends { [key: string]: Fn }
> {
  name: string;
  actions: ResourceActionTypes;
  queries: QueriesDef<TQueries>;
  mutations: MutationsDef<TMutations>;
}

export function createResourceInitializerComponent<
  TQueries extends { [key: string]: Fn },
  TMutations extends { [key: string]: Fn },
  TDeps
>(
  resourceStoreComponent: StoreComponent<ResourceState>,
  createResourceEffectDef: (
    deps: TDeps
  ) => ResourceInitializerDef<TQueries, TMutations>,
  deps: Components<TDeps> = {} as Components<TDeps>
) {
  return createComponent(
    ({ actions, scheduler, resourceStore, deps }) =>
      createResourceInitializer(
        actions,
        scheduler,
        resourceStore,
        createResourceEffectDef(deps)
      ),
    {
      deps: {
        actions: actionsComponent,
        scheduler: schedulerComponent,
        resourceStore: resourceStoreComponent,
        deps: createComponents(deps),
      },
      dispose(resourceInitializer) {
        resourceInitializer.dispose();
      },
    }
  );
}

export function createResourceInitializer<
  TQueries extends { [key: string]: Fn },
  TMutations extends { [key: string]: Fn }
>(
  actions: Actions,
  scheduler: SchedulerLike,
  resourceStore: Store<ResourceState>,
  resourceInitializerDef: ResourceInitializerDef<TQueries, TMutations>
): Disposable {
  const {
    name,
    queries,
    mutations,
    actions: resourceActions,
  } = resourceInitializerDef;
  const disposables: Disposable[] = [];
  if (queries !== undefined) {
    disposables.push(
      createQueryActionsEmitter(name, actions, resourceStore, resourceActions),
      createQueryEffect(name, actions, scheduler, resourceActions, queries)
    );
  }
  if (mutations !== undefined) {
    disposables.push(
      createMutationActionsEmitter(
        name,
        actions,
        resourceStore,
        resourceActions
      ),
      createMutationEffect(name, actions, scheduler, resourceActions, mutations)
    );
  }

  return {
    dispose() {
      for (const disposable of disposables) {
        disposable.dispose();
      }
    },
  };
}
