import {
  Actions,
  actionsComponent,
  Component,
  Components,
  createComponent,
  createComponents,
  Disposable,
  Store,
} from '@lib/state-fx/store';
import { RouterActionTypes } from './router-actions';
import { Router } from './router';
import { RouterState } from './router-store';
import { createRouterActionsMapper } from './router-actions-mapper';
import { createRouterController } from './create-router-controller';

export function createRouterInitializer<TData, TSearchInput, THashInput>(
  actions: Actions,
  router: Router<TData, TSearchInput, THashInput>,
  routerStore: Store<RouterState>,
  routerInitializerDef: RouterInitializerDef<TData, TSearchInput, THashInput>
): Disposable {
  const { name, actions: routerActions } = routerInitializerDef;
  const disposables: Disposable[] = [
    createRouterActionsMapper(name, actions, routerActions, routerStore),
    createRouterController(name, actions, router, routerActions),
  ];
  return {
    dispose() {
      for (const disposable of disposables) {
        disposable.dispose();
      }
    },
  };
}

export interface RouterInitializerDef<TData, TSearchInput, THashInput> {
  name: string;
  actions: RouterActionTypes;
}

export function createRouterInitializerComponent<
  TData,
  TSearchInput,
  THashInput,
  TDeps
>(
  routerComponent: Component<Router<TData, TSearchInput, THashInput>>,
  routerStoreComponent: Component<Store<RouterState>>,
  createRouterInitializerDef: (
    deps: TDeps
  ) => RouterInitializerDef<TData, TSearchInput, THashInput>,
  deps: Components<TDeps> = {} as Components<TDeps>
) {
  return createComponent(
    ({ actions, router, routerStore, deps }) =>
      createRouterInitializer(
        actions,
        router,
        routerStore,
        createRouterInitializerDef(deps)
      ),
    {
      deps: {
        actions: actionsComponent,
        router: routerComponent,
        routerStore: routerStoreComponent,
        deps: createComponents(deps),
      },
    }
  );
}
