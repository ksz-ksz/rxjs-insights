import {
  combineReactions,
  createReaction,
  effect,
  filterActions,
  select,
  Store,
} from '@lib/store';
import { createUrl, filterRoute } from '@lib/store-router';
import { router, targetRouteToken } from '@app/router';
import {
  concat,
  concatMap,
  delay,
  EMPTY,
  endWith,
  from,
  map,
  merge,
  of,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs';
import { insightsClient } from '@app/clients/insights';
import { insightsActions } from '@app/actions/insights-actions';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { getEventElementId } from '@app/utils/get-event-element-id';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';
import { targetsClient } from '@app/clients/targets';
import { targetsSelector } from '@app/selectors/targets-selectors';
import { TargetsSlice } from '@app/store/targets';

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
  )
  .add(
    createReaction(
      (action$, { targets$ }) =>
        action$.pipe(
          filterActions(subscribersGraphActions.FocusTarget),
          withLatestFrom(targets$),
          concatMap(([action, targets]) =>
            !targets.targets.find(
              (target) => target.id === action.payload.target.id
            )
              ? of(action.payload.target.id)
              : from(
                  targetsClient.addTarget(action.payload.target.refId!)
                ).pipe(map(() => action.payload.target.id))
          ),
          map((targetId) =>
            router.actions.Navigate({
              url: createUrl(['target', String(targetId)]),
            })
          )
        ),
      (store: Store<TargetsSlice>) => ({
        targets$: store.pipe(select(targetsSelector)),
      })
    )
  );
