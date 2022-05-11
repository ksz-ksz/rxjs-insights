export const InstrumentationChannel = 'InstrumentationChannel';

export type InstrumentationStatus =
  | 'installed'
  | 'not-installed'
  | 'not-available';

export interface Instrumentation {
  install(): void;
  getStatus(): InstrumentationStatus;
}
