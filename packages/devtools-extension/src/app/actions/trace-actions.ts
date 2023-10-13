import { Trace } from '@app/protocols/traces';
import { createActions } from '@lib/state-fx/store';

export interface TraceActions {
  TraceLoaded: { trace?: Trace };
}

export const traceActions = createActions<TraceActions>({ namespace: 'Trace' });
