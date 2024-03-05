import { createResource } from '@lib/state-fx/store-resource';
import { TargetState } from '@app/protocols/insights';

export type InsightsQueries = {
  getTargetState(targetId: number): TargetState | undefined;
};

export type InsightsMutations = {};

export const {
  keys: { query: insightsQueryKeys },
  actions: insightsResourceActions,
  component: insightsResourceComponent,
  storeComponent: insightsResourceStoreComponent,
  configComponent: insightsConfigComponent,
} = createResource<InsightsQueries, InsightsMutations>({
  name: 'insights-resource',
});
