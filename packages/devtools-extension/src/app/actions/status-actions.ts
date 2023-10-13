import { InstrumentationStatus } from '@app/protocols/instrumentation-status';
import { createActions } from '@lib/state-fx/store';

export interface StatusActions {
  InstrumentationStatusResolved: {
    instrumentationStatus: InstrumentationStatus | 'not-connected' | undefined;
  };
}

export const statusActions = createActions<StatusActions>({
  namespace: 'Status',
});
