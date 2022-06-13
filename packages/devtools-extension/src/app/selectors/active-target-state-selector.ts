import { createSelector } from '@lib/store';
import {
  observableRouteToken,
  router,
  subscriberRouteToken,
} from '@app/router';
import { insightsSelector } from '@app/selectors/insights-selectors';

export const activeObservableStateSelector = createSelector(
  [router.selectors.route(observableRouteToken), insightsSelector],
  ([route, insights]) =>
    route?.params?.observableId
      ? insights.observables[parseInt(route.params.observableId, 10)]
      : undefined
);
export const activeSubscriberStateSelector = createSelector(
  [router.selectors.route(subscriberRouteToken), insightsSelector],
  ([route, insights]) =>
    route?.params?.subscriberId
      ? insights.subscribers[parseInt(route.params.subscriberId, 10)]
      : undefined
);
