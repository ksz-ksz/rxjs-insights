import { createClient, createInspectedWindowEvalClientAdapter } from '@lib/rpc';
import { Traces, TracesChannel } from '@app/protocols/traces';

export const tracesClient = createClient<Traces>(
  createInspectedWindowEvalClientAdapter(TracesChannel)
);
