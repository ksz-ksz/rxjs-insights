export const TargetStatusChannel = 'TargetStatusChannel';

export type InstrumentationStatus =
  | 'installed'
  | 'not-installed'
  | 'not-available';

export interface TargetStatus {
  installInstrumentation(): void;
  getInstrumentationStatus(): InstrumentationStatus;
}
