import { createActions } from '@lib/store';

export interface InstrumentationStatusPageActions {
  WaitForInstrumentationButtonClicked: void;
}

export const instrumentationStatusPageActions =
  createActions<InstrumentationStatusPageActions>('InstrumentationStatusPage');
