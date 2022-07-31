import { InstrumentationStatus } from '@app/protocols/instrumentation-status';
import { createActions } from '@lib/store';

export interface StatusActions {
  InstrumentationStatusResolved: {
    instrumentationStatus: InstrumentationStatus | 'not-connected' | undefined;
  };
}

export const statusActions = createActions<StatusActions>('Status');
