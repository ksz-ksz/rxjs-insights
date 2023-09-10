import { createReaction, filterActions, Store } from '@lib/store';
import { map } from 'rxjs';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';
import { insightsActions } from '@app/actions/insights-actions';
import { old_router } from '@app/old_router';
import { createUrl } from '@lib/store-router';
import { RouterSlice } from '@app/store/router';

export const timeReaction = createReaction(
  (action$, { getCurrentUrl }) =>
    action$.pipe(
      filterActions([
        eventsLogActions.EventSelected,
        refOutletContextActions.FocusEvent,
        insightsActions.PlayNextEvent,
      ]),
      map((action) => {
        const currentUrl = getCurrentUrl();
        return old_router.actions.Navigate({
          url: createUrl(currentUrl.path, {
            queryParams: {
              ...currentUrl.queryParams,
              time: String(action.payload.event.time),
            },
            fragment: currentUrl.fragment,
          }),
        });
      })
    ),
  (store: Store<RouterSlice>) => ({
    getCurrentUrl() {
      return store.select(old_router.selectors.url).get();
    },
  })
);
