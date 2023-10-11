import {
  Actions,
  actionsComponent,
  ActionTypes,
  Component,
  Container,
  Effect,
  InitializedComponent,
  Store,
  StoreComponent,
} from '../store';
import { Router, RouterComponent } from './router';
import { RouteConfig, RoutingRule } from './route-config';
import { History, HistoryEntry, PopEntryListener } from './history';
import { Observable } from 'rxjs';
import { createRouterEffect } from './create-router-effect';
import { RouterActions } from './router-actions';
import { RouterState } from './router-store';
import { ComponentsResolver } from './components-resolver';

export interface StartRouterOptions<TData> {
  router: RouterComponent<TData>;
  routerStore: StoreComponent<string, RouterState>;
  routerActions: ActionTypes<RouterActions>;
  routerConfig: RouteConfig<TData>;
}

export function fromHistory(history: History): Observable<HistoryEntry> {
  return new Observable((observer) => {
    const listener: PopEntryListener = (entry) => {
      observer.next(entry);
    };

    history.addPopEntryListener(listener);

    return () => {
      history.removePopEntryListener(listener);
    };
  });
}

export interface Routing extends Effect {}

export interface RoutingComponent extends Component<Routing> {}

function createRoutingInstance<TData>(
  actions: Actions,
  router: Router<TData>,
  routerStore: Store<string, RouterState>,
  routerActions: ActionTypes<RouterActions>,
  routingRulesResolver: ComponentsResolver<RoutingRule<TData>>
): Routing {
  return createRouterEffect(
    actions,
    router,
    routerActions,
    routerStore,
    routingRulesResolver
  );
}

function createRoutingComponent<TData>(
  router: RouterComponent<TData>,
  routerStore: StoreComponent<string, RouterState>,
  routerActions: ActionTypes<RouterActions>,
  routerConfig: RouteConfig<TData>
): RoutingComponent {
  return {
    init(container: Container): InitializedComponent<Routing> {
      const actionsRef = container.use(actionsComponent);
      const routerRef = container.use(router);
      const routerStoreRef = container.use(routerStore);
      const routingRulesResolver = new ComponentsResolver<RoutingRule<TData>>(
        container
      );

      routerRef.component.init(routerConfig);

      const routing = createRoutingInstance(
        actionsRef.component,
        routerRef.component,
        routerStoreRef.component,
        routerActions,
        routingRulesResolver
      );

      return {
        component: routing,
        dispose() {
          routing.dispose();
          actionsRef.release();
          routerStoreRef.release();
          routingRulesResolver.dispose();
        },
      };
    },
  };
}

export function createRouting<TData>({
  router,
  routerActions,
  routerStore,
  routerConfig,
}: StartRouterOptions<TData>): RoutingComponent {
  return createRoutingComponent(
    router,
    routerStore,
    routerActions,
    routerConfig
  );
}
