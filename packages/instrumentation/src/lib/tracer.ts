import { EventRef, ObservableRef } from './recorder';
import { InstrumentationContext } from './env';

export interface Trace {
  eventRef: EventRef;
  observableRef: ObservableRef | undefined;
}

export interface Tracer {
  init?(context: InstrumentationContext): void;

  run<T>(trace: Trace, run: () => T): T;

  getTrace(): Trace | undefined;
}
