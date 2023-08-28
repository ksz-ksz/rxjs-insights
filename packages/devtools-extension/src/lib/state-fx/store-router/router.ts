import { History } from './history';
import { Routing, routings } from './routing';
import { RouterSelectors } from './router-selectors';
import { RouterActions } from './router-actions';
import { Actions, createActions, createStateSelector } from '../store';
import { RouterState } from './router-reducer';
import { matchRoutes, RouteMatch } from './match-routes';

export interface Router<TNamespace extends string, TConfig> {
  namespace: TNamespace;
  actions: Actions<RouterActions>;
  selectors: RouterSelectors<TNamespace>;
  start(routing: Routing<any, TConfig, any, any, any>): void;
  match(pathname: string): RouteMatch[];
  getRouting(id: number): Routing<any, TConfig, any, any, any>;
}

export interface CreateRouterOptions<TNamespace extends string, TConfig> {
  namespace: TNamespace;
  history: History;
  config?: TConfig;
}

export function createRouter<TNamespace extends string, TConfig>({
  namespace,
  history,
}: CreateRouterOptions<TNamespace, TConfig>): Router<TNamespace, TConfig> {
  return new HistoryRouter(namespace, history);
}

class HistoryRouter<TNamespace extends string, TConfig>
  implements Router<TNamespace, TConfig>
{
  private routing: Routing<any, TConfig, any, any, any> | undefined = undefined;
  constructor(readonly namespace: TNamespace, readonly history: History) {}

  readonly actions = createActions<RouterActions>({
    namespace: this.namespace,
  });

  readonly selectors = {
    selectState: createStateSelector(
      (state: Record<TNamespace, RouterState>) => state[this.namespace]
    ),
  };

  match(pathname: string): RouteMatch[] {
    if (this.routing === undefined) {
      throw new Error(`router not started`);
    }
    return matchRoutes(this.routing, pathname);
  }

  getRouting(id: number): Routing<any, TConfig, any, any, any> {
    const routing = routings.get(id);
    if (routing !== undefined) {
      return routing;
    } else {
      throw new Error(`no routing with id "${id}"`);
    }
  }

  start(routing: Routing<any, TConfig, any, any, any>): void {
    if (this.routing !== undefined) {
      throw new Error('router already started');
    }
    this.routing = routing;
  }
}
