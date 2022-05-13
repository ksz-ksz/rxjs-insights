import { createClient, createInspectedWindowEvalClientAdapter } from '@lib/rpc';
import {
  Instrumentation,
  InstrumentationChannel,
} from '@app/protocols/instrumentation-status';

export const instrumentationClient = createClient<Instrumentation>(
  createInspectedWindowEvalClientAdapter(InstrumentationChannel)
);
