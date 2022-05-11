import { createActions } from '@lib/store';

export interface InstrumentationStatusPageActions {
  WaitForInstrumentationButtonClicked: void;
  ReloadPageButtonClicked: void;
}

export const instrumentationStatusPageActions =
  createActions<InstrumentationStatusPageActions>('instrumentationStatusPage');
