import { createSelector, createSliceSelector } from '@lib/store';
import { InsightsState } from '@app/store/insights';
import {
  observableRouteToken,
  router,
  subscriberRouteToken,
} from '@app/router';

const insightsState = createSliceSelector<'insights', InsightsState>(
  'insights'
);

export const observableState = createSelector(
  {
    route: router.selectors.route(observableRouteToken),
    insights: insightsState,
  },
  ({ route, insights }) =>
    route?.params?.observableId
      ? insights.observables[parseInt(route.params.observableId, 10)]
      : undefined
);

export const subscriberState = createSelector(
  {
    route: router.selectors.route(subscriberRouteToken),
    insights: insightsState,
  },
  ({ route, insights }) =>
    route?.params?.subscriberId
      ? insights.subscribers[parseInt(route.params.subscriberId, 10)]
      : undefined
);
