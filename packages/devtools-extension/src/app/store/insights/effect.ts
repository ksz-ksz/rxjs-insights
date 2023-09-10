import {
  concat,
  delay,
  endWith,
  filter,
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
import { routeActivated, routeDeactivated } from '@app/utils';
import { createEffect } from '@lib/state-fx/store';
import { router } from '@app/router';
import { targetRoute } from '@app/routes';
import { is } from '../../../lib/state-fx/store/is';

export const insightsEffect = createEffect({
  namespace: 'insights',
  effects: {
    loadTargetAfterActivatingTheRoute(action) {
      return action.pipe(
        routeActivated(router, targetRoute),
        switchMap((route) => {
          const targetId = route.params.targetId;
          return action.pipe(
            filter(appBarActions.RefreshData.is),
            startWith(undefined),
            takeUntil(action.pipe(routeDeactivated(router, targetRoute))),
            switchMap(() => from(insightsClient.getTargetState(targetId)))
          );
        }),
        map((state) => insightsActions.TargetStateLoaded({ state }))
      );
    },
    autoplayEvents(action$) {
      return action$.pipe(
        filter(eventsLogActions.Play.is),
        switchMap((action) =>
          concat(
            ...action.payload.events.map((event) =>
              of(insightsActions.PlayNextEvent({ event })).pipe(delay(1000))
            )
          ).pipe(
            takeUntil(
              merge(
                action$.pipe(
                  filter(
                    is(eventsLogActions.Pause, eventsLogActions.EventSelected)
                  )
                ),
                action$.pipe(routeDeactivated(router, targetRoute))
              )
            ),
            endWith(insightsActions.PlayDone())
          )
        )
      );
    },
    navigateToTarget(action$) {
      return merge(
        action$.pipe(
          filter(subscribersGraphActions.FocusTarget.is),
          map((action) => action.payload.toTarget)
        ),
        action$.pipe(
          filter(refOutletContextActions.FocusTarget.is),
          map((action) => action.payload.target)
        )
      ).pipe(
        map((target) =>
          router.actions.Navigate({
            location: targetRoute({
              params: {
                targetId: target.id,
              },
            }),
          })
        )
      );
    },
  },
});
