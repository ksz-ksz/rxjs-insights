import { createActions } from '@lib/store';
import { Trace } from '@app/protocols/traces';

export interface TraceActions {
  TraceLoaded: { trace?: Trace };
}

export const traceActions = createActions<TraceActions>('Trace');
