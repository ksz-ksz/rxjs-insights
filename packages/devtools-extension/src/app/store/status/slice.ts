import { Slice } from '@lib/store';
import { InstrumentationStatus } from '@app/protocols';

export const status = 'status';

export interface StatusState {
  instrumentationStatus: InstrumentationStatus | undefined;
}

export type StatusSlice = Slice<typeof status, StatusState>;
