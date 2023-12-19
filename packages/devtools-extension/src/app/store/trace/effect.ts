import { routeActivated, routeDeactivated } from '@app/utils';
import {
  catchError,
  EMPTY,
  from,
  map,
  switchMap,
  takeUntil,
  timer,
} from 'rxjs';
import { tracesClient } from '@app/clients/traces';
import { traceActions } from '@app/actions/trace-actions';
import { createEffectComponent } from '@lib/state-fx/store';
import { routerActions } from '@app/router';
import { dashboardRoute } from '@app/routes';

export const traceEffect = createEffectComponent(() => ({
  name: 'trace',
  effects: {
    handleDashboardEnter(actions) {
      return actions.select(routeActivated(routerActions, dashboardRoute)).pipe(
        switchMap(() =>
          timer(0, 1000).pipe(
            switchMap(() =>
              from(tracesClient.getTrace()).pipe(
                map((trace) => traceActions.TraceLoaded({ trace })),
                catchError(() => EMPTY)
              )
            ),
            takeUntil(
              actions.select(routeDeactivated(routerActions, dashboardRoute))
            )
          )
        )
      );
    },
  },
}));
