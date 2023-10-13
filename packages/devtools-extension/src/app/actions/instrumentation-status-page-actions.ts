import { createActions } from '@lib/state-fx/store';

export interface InstrumentationStatusPageActions {
  WaitForInstrumentationButtonClicked: void;
}

export const instrumentationStatusPageActions =
  createActions<InstrumentationStatusPageActions>({
    namespace: 'InstrumentationStatusPage',
  });
