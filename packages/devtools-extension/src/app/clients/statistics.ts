import { createClient, createInspectedWindowEvalClientAdapter } from '@lib/rpc';
import { Statistics, StatisticsChannel } from '@app/protocols/statistics';

export const statisticsClient = createClient<Statistics>(
  createInspectedWindowEvalClientAdapter(StatisticsChannel)
);
