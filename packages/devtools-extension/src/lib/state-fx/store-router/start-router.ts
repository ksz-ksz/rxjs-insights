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
  routing: Routing<unknown, TConfig, unknown, unknown, unknown>;
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

export function startRouter<TNamespace extends string, TConfig>({
  store,
  router,
  routing,
}: StartRouterOptions<TNamespace, unknown, TConfig>) {
  router.start(routing);
  store.registerEffect(createRouterEffect(router));
  store.dispatch(
    router.actions.NavigationRequested({
      origin: router.history.currentEntryOrigin,
      location: router.history.currentEntry.location,
      state: router.history.currentEntry.state,
      key: 'default',
    })
  );
}
