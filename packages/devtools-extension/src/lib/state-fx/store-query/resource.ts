import { Fn } from './fn';
import {
  Actions,
  Component,
  createComponent,
  Disposable,
} from '@lib/state-fx/store';
import { SchedulerLike } from 'rxjs';
import { createResourceKeys, ResourceKeys } from './resource-key';
import { createResourceActions, ResourceActionTypes } from './resource-actions';
import { createResourceStoreComponent } from './resource-store';
import {
  createResourceInitializerComponent,
  ResourceInitializerDef,
} from './resource-effect';
import { QueriesDef } from './queries';
import { MutationsDef } from './mutations';

export interface ResourceDef {
  name: string;
}

export interface ResourceConfig<
  TQueries extends { [key: string]: Fn },
  TMutations extends { [key: string]: Fn }
> {
  queries: QueriesDef<TQueries>;
  mutations: MutationsDef<TMutations>;
}

function createResourceConfigComponent<
  TQueries extends { [key: string]: Fn },
  TMutations extends { [key: string]: Fn }
>() {
  return createComponent((): ResourceConfig<TQueries, TMutations> => {
    throw new Error('not provided');
  });
}

export function createResource<
  TQueries extends { [key: string]: Fn },
  TMutations extends { [key: string]: Fn }
>(
  def: ResourceDef
): {
  keys: {
    query: ResourceKeys<TQueries>;
    mutation: ResourceKeys<TMutations>;
  };
  actions: ResourceActionTypes;
  component: Component<Disposable>;
  configComponent: Component<ResourceConfig<TQueries, TMutations>>;
} {
  const { name } = def;
  const keys = createResourceKeys<TQueries, TMutations>();
  const actions = createResourceActions(name);
  const storeComponent = createResourceStoreComponent(name, actions);
  const configComponent = createResourceConfigComponent<TQueries, TMutations>();
  const component = createResourceInitializerComponent(
    storeComponent,
    ({
      config: { queries, mutations },
    }): ResourceInitializerDef<TQueries, TMutations> => ({
      name,
      actions,
      queries,
      mutations,
    }),
    { config: configComponent }
  );
  return {
    keys,
    actions,
    component,
    configComponent,
  };
}
