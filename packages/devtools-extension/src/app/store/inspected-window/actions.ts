import { createActions } from '@lib/store';
import { inspectedWindow } from '@app/store/inspected-window/slice';

export interface InspectedWindowActions {
  InspectedWindowReloaded: void;
}

export const inspectedWindowActions =
  createActions<InspectedWindowActions>(inspectedWindow);
