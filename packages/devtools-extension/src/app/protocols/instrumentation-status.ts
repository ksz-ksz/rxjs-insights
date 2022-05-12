export const InstrumentationChannel = 'InstrumentationChannel';

export interface Instrumentation {
  install(): void;
  getStatus(): InstrumentationStatus;
}

export type InstrumentationStatus =
  | 'installed'
  | 'not-installed'
  | 'not-available';
