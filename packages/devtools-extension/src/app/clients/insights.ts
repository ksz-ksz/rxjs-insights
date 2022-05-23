import { createClient, createInspectedWindowEvalClientAdapter } from '@lib/rpc';
import { Insights, InsightsChannel } from '@app/protocols/insights';

export const insightsClient = createClient<Insights>(
  createInspectedWindowEvalClientAdapter(InsightsChannel)
);
