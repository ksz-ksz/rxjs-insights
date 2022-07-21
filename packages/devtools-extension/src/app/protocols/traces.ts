import { Locations } from '@rxjs-insights/core';
import { EventRef } from '@app/protocols/refs';

export const TracesChannel = 'TracesChannel';

export interface TraceFrame {
  ref: EventRef;
  task: {
    name: string;
    id: number;
  };
  event: {
    type: 'next' | 'error' | 'complete' | 'subscribe' | 'unsubscribe';
    name: string;
    id: number;
  };
  target: {
    type: 'subscriber' | 'observable';
    name: string;
    id: number;
    locations: Locations;
  };
}

export type Trace = TraceFrame[];

export interface Traces {
  getTrace(): Trace | undefined;
}
