import { combineReactions, createReaction, filterActions } from '@lib/store';
import { filterRoute } from '@lib/store-router';
import { observableRouteToken, router } from '@app/router';
import { EMPTY, from, map, switchMap } from 'rxjs';
import { dataClient } from '@app/clients/data';
import { insightsActions } from '@app/actions/insights-actions';

export const insightsReaction = combineReactions().add(
  createReaction((action$) =>
    action$.pipe(
      filterActions(router.actions.NavigationComplete),
      filterRoute(router, observableRouteToken),
      switchMap((route) => {
        const observableId = route.params?.observableId;
        return observableId !== undefined
          ? from(dataClient.getObservableInfo(parseInt(observableId, 10)))
          : EMPTY;
      }),
      map((info) => insightsActions.ObservableInfoLoaded({ info }))
    )
  )
);
