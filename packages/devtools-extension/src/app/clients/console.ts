import { createClient, createInspectedWindowEvalClientAdapter } from '@lib/rpc';
import { ConsoleChannel, Console } from '@app/protocols/console';

export const consoleClient = createClient<Console>(
  createInspectedWindowEvalClientAdapter(ConsoleChannel)
);
