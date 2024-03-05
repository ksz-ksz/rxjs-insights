import { createComponent } from '@lib/state-fx/store';
import { ResourceConfig } from '@lib/state-fx/store-resource';
import {
  InsightsMutations,
  InsightsQueries,
} from '@app/store/insights/insights-resource';
import { insightsClient } from '@app/clients/insights';
import { from } from 'rxjs';

export const insightsResourceConfigComponent = createComponent(
  (): ResourceConfig<InsightsQueries, InsightsMutations> => ({
    queries: {
      getTargetState: {
        queryFn: ([targetId]) => from(insightsClient.getTargetState(targetId)),
      },
    },
    mutations: {},
  })
);
