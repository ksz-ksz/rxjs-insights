import { map, merge } from 'rxjs';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';
import { insightsActions } from '@app/actions/insights-actions';
import { createEffect, createSelectorFunction } from '@lib/state-fx/store';
import { routerActions, routerStore, selectRouterState } from '@app/router';
import { Router } from '@lib/state-fx/store-router';

export const timeEffect = createEffect({
  namespace: 'time',
  deps: [routerStore],
})({
  syncTimeInUrl(actions, deps) {
    const getRouterState = createSelectorFunction(selectRouterState);
    return merge(
      actions.ofType(eventsLogActions.EventSelected),
      actions.ofType(refOutletContextActions.FocusEvent),
      actions.ofType(insightsActions.PlayNextEvent)
    ).pipe(
      map((action) => {
        const router: Router<any> = undefined; // TODO: fix - allow for component deps
        const routerState = getRouterState(deps.getState());

        return routerActions.Navigate({
          historyMode: 'replace',
          location: {
            ...routerState.location,
            search: router.searchEncoder.encode({
              ...router.searchEncoder.decode(routerState.location.search),
              time: String(action.payload.event.time),
            }),
          },
          state: routerState.state,
        });
      })
    );
  },
});
