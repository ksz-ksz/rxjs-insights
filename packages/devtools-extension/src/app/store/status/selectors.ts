import { createSelectors } from '@lib/store';
import { status, StatusState } from '@app/store/status/slice';

export const statusSelectors = createSelectors(status, {
  instrumentationStatus(status: StatusState) {
    return status.instrumentationStatus;
  },
});
