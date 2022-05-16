import { createClient, createInspectedWindowEvalClientAdapter } from '@lib/rpc';
import { Targets, TargetsChannel } from '@app/protocols/targets';

export const targetsClient = createClient<Targets>(
  createInspectedWindowEvalClientAdapter(TargetsChannel)
);
