import {
  combineReactions,
  createReaction,
  effect,
  filterActions,
} from '@lib/store';
import { filterRoute } from '@lib/store-router';
import {
  observableRouteToken,
  router,
  subscriberRouteToken,
} from '@app/router';
import { EMPTY, from, map, switchMap } from 'rxjs';
import { insightsClient } from '@app/clients/insights';
import { insightsActions } from '@app/actions/insights-actions';
import { inspect } from '@rxjs-insights/console';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { getEventElementId } from '@app/utils/get-event-element-id';

export const insightsReaction = combineReactions()
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(router.actions.RouteEnter),
        filterRoute(router, observableRouteToken),
        switchMap((route) => {
          const observableId = route.params?.observableId;
          return observableId !== undefined
            ? from(
                insightsClient.getObservableState(parseInt(observableId, 10))
              )
            : EMPTY;
        }),
        map((state) => insightsActions.ObservableStateLoaded({ state }))
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(router.actions.RouteEnter),
        filterRoute(router, subscriberRouteToken),
        switchMap((route) => {
          const subscriberId = route.params?.subscriberId;
          return subscriberId !== undefined
            ? from(
                insightsClient.getSubscriberState(parseInt(subscriberId, 10))
              )
            : EMPTY;
        }),
        map((state) => insightsActions.SubscriberStateLoaded({ state }))
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(eventsLogActions.EventSelected),
        effect((action) => {
          const element = document.getElementById(
            getEventElementId(action.payload.event.time)
          );
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest',
            });
          }
        })
      )
    )
  );
