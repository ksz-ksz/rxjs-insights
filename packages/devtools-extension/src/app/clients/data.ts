import { createClient, createInspectedWindowEvalClientAdapter } from '@lib/rpc';
import { Data, DataChannel } from '@app/protocols/data';

export const dataClient = createClient<Data>(
  createInspectedWindowEvalClientAdapter(DataChannel)
);
