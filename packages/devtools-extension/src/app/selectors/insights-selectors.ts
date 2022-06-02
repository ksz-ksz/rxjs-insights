import { createSelector, createSliceSelector } from '@lib/store';
import { InsightsState } from '@app/store/insights';
import { observableRouteToken, router } from '@app/router';

const insightsState = createSliceSelector<'insights', InsightsState>(
  'insights'
);

export const observableRef = createSelector(
  {
    route: router.selectors.route(observableRouteToken),
    insights: insightsState,
  },
  ({ route, insights }) =>
    route?.params?.observableId
      ? insights.observables[parseInt(route.params.observableId, 10)]?.ref
      : undefined
);
