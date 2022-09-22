import { combineReactions, createReaction, filterActions } from '@lib/store';
import { createUrl, filterRoute } from '@lib/store-router';
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
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs';
import { insightsClient } from '@app/clients/insights';
import { insightsActions } from '@app/actions/insights-actions';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { routeEnter, routeLeave } from '@app/utils';

export const insightsReaction = combineReactions()
  .add(
    createReaction((action$) =>
      action$.pipe(
        routeEnter(targetRouteToken),
        switchMap((route) => {
          const targetId = route.params?.targetId;
          return targetId !== undefined
            ? action$.pipe(
                filterActions(appBarActions.RefreshData),
                startWith(undefined),
                takeUntil(action$.pipe(routeLeave(targetRouteToken))),
                switchMap(() =>
                  from(insightsClient.getTargetState(parseInt(targetId, 10)))
                )
              )
            : EMPTY;
        }),
        map((state) => insightsActions.TargetStateLoaded({ state }))
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
  )
  .add(
    createReaction((action$) =>
      merge(
        action$.pipe(
          filterActions(subscribersGraphActions.FocusTarget),
          map((action) => action.payload.toTarget)
        ),
        action$.pipe(
          filterActions(refOutletContextActions.FocusTarget),
          map((action) => action.payload.target)
        )
      ).pipe(
        map((target) =>
          router.actions.Navigate({
            url: createUrl(['target', String(target.id)]),
          })
        )
      )
    )
  );
