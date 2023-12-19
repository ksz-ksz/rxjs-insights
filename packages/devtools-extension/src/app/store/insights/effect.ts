import {
  concat,
  delay,
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
import { routeActivated, routeDeactivated } from '@app/utils';
import { createEffectComponent } from '@lib/state-fx/store';
import { routerActions } from '@app/router';
import { targetRoute } from '@app/routes';

export const insightsEffect = createEffectComponent(() => ({
  name: 'insights',
  effects: {
    loadTargetAfterActivatingTheRoute(actions) {
      return actions.select(routeActivated(routerActions, targetRoute)).pipe(
        switchMap((route) => {
          const targetId = route.params.targetId;
          return actions.ofType(appBarActions.RefreshData).pipe(
            startWith(undefined),
            takeUntil(
              actions.select(routeDeactivated(routerActions, targetRoute))
            ),
            switchMap(() => from(insightsClient.getTargetState(targetId)))
          );
        }),
        map((state) => insightsActions.TargetStateLoaded({ state }))
      );
    },
    autoplayEvents(actions) {
      return actions
        .ofType(eventsLogActions.Play)
        .pipe(
          switchMap((action) =>
            concat(
              ...action.payload.events.map((event) =>
                of(insightsActions.PlayNextEvent({ event })).pipe(delay(1000))
              )
            ).pipe(
              takeUntil(
                merge(
                  actions.ofType(eventsLogActions.Pause),
                  actions.ofType(eventsLogActions.EventSelected),
                  actions.select(routeDeactivated(routerActions, targetRoute))
                )
              ),
              endWith(insightsActions.PlayDone())
            )
          )
        );
    },
    navigateToTarget(actions) {
      return merge(
        actions
          .ofType(subscribersGraphActions.FocusTarget)
          .pipe(map((action) => action.payload.toTarget)),
        actions
          .ofType(refOutletContextActions.FocusTarget)
          .pipe(map((action) => action.payload.target))
      ).pipe(
        map((target) =>
          routerActions.Navigate({
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
}));
