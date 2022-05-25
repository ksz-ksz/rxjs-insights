import { Locations } from '@rxjs-insights/core';

export const TracesChannel = 'TracesChannel';

export interface TraceFrame {
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
