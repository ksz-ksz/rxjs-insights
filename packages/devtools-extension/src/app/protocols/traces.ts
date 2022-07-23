import { Locations } from '@rxjs-insights/core';
import { EventRef, TargetRef } from '@app/protocols/refs';

export const TracesChannel = 'TracesChannel';

export interface TraceFrame {
  task: {
    name: string;
    id: number;
  };
  event: EventRef;
  target: TargetRef;
  locations: Locations;
}

export type Trace = TraceFrame[];

export interface Traces {
  getTrace(): Trace | undefined;
}
