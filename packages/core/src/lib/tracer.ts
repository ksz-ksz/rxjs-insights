import { EventRef, TargetRef } from './recorder';
import { InstrumentationContext } from './env';

export interface Trace {
  eventRef: EventRef;
  targetRef: TargetRef | undefined;
}

export interface Tracer {
  init?(context: InstrumentationContext): void;

  run<T>(trace: Trace, run: () => T): T;

  getTrace(): Trace | undefined;
}
