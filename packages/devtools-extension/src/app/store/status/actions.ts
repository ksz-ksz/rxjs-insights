import { InstrumentationStatus } from '@app/protocols/instrumentation-status';
import { createActions } from '@lib/store';
import { status } from '@app/store/status/slice';

export interface StatusActions {
  InstrumentationStatusResolved: {
    instrumentationStatus: InstrumentationStatus | undefined;
  };
}

export const statusActions = createActions<StatusActions>(status);