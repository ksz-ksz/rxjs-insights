import { createActions } from '@lib/store';

export interface InspectedWindowActions {
  InspectedWindowReloaded: void;
}

export const inspectedWindowActions =
  createActions<InspectedWindowActions>('InspectedWindow');
