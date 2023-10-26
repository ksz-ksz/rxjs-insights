import {
  createStoreSuperSelector,
  createSuperSelector,
} from '../../lib/state-fx/store/super-selector';
import { statusStore } from '@app/store/status/store';

export const selectStatusState = createStoreSuperSelector(statusStore);

export const selectInstrumentationStatus = createSuperSelector(
  [selectStatusState],
  (context) => {
    const statusState = selectStatusState(context);
    return statusState.instrumentationStatus;
  }
);
