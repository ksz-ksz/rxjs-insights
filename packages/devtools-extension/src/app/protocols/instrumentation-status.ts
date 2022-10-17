export const InstrumentationChannel = 'InstrumentationChannel';

export interface Instrumentation {
  getStatus(): InstrumentationStatus;
}

export type InstrumentationStatus =
  | 'installed'
  | 'not-installed'
  | 'not-compatible';
