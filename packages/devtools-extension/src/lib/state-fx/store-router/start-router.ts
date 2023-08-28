import { Store } from '../store';
import { Router } from './router';
import { Routing } from './routing';
import { History, HistoryEntry, PopEntryListener } from './history';
import { Observable } from 'rxjs';
import { createRouterEffect } from './create-router-effect';

export interface StartRouterOptions<
  TNamespace extends string,
  TState,
  TConfig
> {
  store: Store<TState>;
  router: Router<TNamespace, TConfig>;
  routing: Routing<TState, TConfig, unknown, unknown, unknown>;
  history: History;
}

function fromHistory(history: History): Observable<HistoryEntry> {
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

export function startRouter<TNamespace extends string, TState, TConfig>({
  store,
  history,
  router,
  routing,
}: StartRouterOptions<TNamespace, TState, TConfig>) {
  createRouterEffect(router);
}
