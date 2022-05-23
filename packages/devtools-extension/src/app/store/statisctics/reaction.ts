import { combineReactions, createReaction, filterActions } from '@lib/store';
import { from, map, merge, switchMap } from 'rxjs';
import { statisticsClient } from '@app/clients/statistics';
import { statisticsActions } from '@app/actions/statistics-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { dashboardRouteToken, router } from '@app/router';
import { filterRoute } from '@lib/store-router';

export const statisticsReaction = combineReactions().add(
  createReaction((action$) =>
    merge(
      action$.pipe(
        filterActions(router.actions.RouteEnter),
        filterRoute(router, dashboardRouteToken)
      ),
      action$.pipe(filterActions(appBarActions.RefreshData))
    ).pipe(
      switchMap(() =>
        from(statisticsClient.getStats()).pipe(
          map((stats) => statisticsActions.StatsResolved({ stats }))
        )
      )
    )
  )
);
