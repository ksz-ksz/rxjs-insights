import {
  combineReactions,
  createReaction,
  effect,
  filterActions,
} from '@lib/store';
import { filterRoute } from '@lib/store-router';
import { router, targetRouteToken } from '@app/router';
import {
  concat,
  delay,
  EMPTY,
  endWith,
  from,
  map,
  merge,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';
import { insightsClient } from '@app/clients/insights';
import { insightsActions } from '@app/actions/insights-actions';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { getEventElementId } from '@app/utils/get-event-element-id';

export const insightsReaction = combineReactions()
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(router.actions.RouteEnter),
        filterRoute(router, targetRouteToken),
        switchMap((route) => {
          const targetId = route.params?.targetId;
          return targetId !== undefined
            ? from(insightsClient.getTargetState(parseInt(targetId, 10)))
            : EMPTY;
        }),
        map((state) => insightsActions.TargetStateLoaded({ state }))
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions([
          eventsLogActions.EventSelected,
          insightsActions.PlayNextEvent,
        ]),
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
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(eventsLogActions.Play),
        switchMap((action) =>
          concat(
            ...action.payload.events.map((event) =>
              of(insightsActions.PlayNextEvent({ event })).pipe(delay(1000))
            )
          ).pipe(
            takeUntil(
              merge(
                action$.pipe(
                  filterActions([
                    eventsLogActions.Pause,
                    eventsLogActions.EventSelected,
                  ])
                ),
                action$.pipe(
                  filterActions(router.actions.RouteLeave),
                  filterRoute(router, targetRouteToken)
                )
              )
            ),
            endWith(insightsActions.PlayDone())
          )
        )
      )
    )
  );
