import { combineReactions, createReaction } from '@lib/store';
import { routeEnter, routeLeave } from '@app/utils';
import { dashboardRouteToken } from '@app/router';
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

export const traceReaction = combineReactions().add(
  createReaction((action$) =>
    action$.pipe(
      routeEnter(dashboardRouteToken),
      switchMap(() =>
        timer(0, 1000).pipe(
          switchMap(() =>
            from(tracesClient.getTrace()).pipe(
              map((trace) => traceActions.TraceLoaded({ trace })),
              catchError(() => EMPTY)
            )
          ),
          takeUntil(action$.pipe(routeLeave(dashboardRouteToken)))
        )
      )
    )
  )
);
