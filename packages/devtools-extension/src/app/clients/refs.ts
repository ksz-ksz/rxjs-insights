import { createClient, createInspectedWindowEvalClientAdapter } from '@lib/rpc';
import { Refs, RefsChannel } from '@app/protocols/refs';

export const refsClient = createClient<Refs>(
  createInspectedWindowEvalClientAdapter(RefsChannel)
);
