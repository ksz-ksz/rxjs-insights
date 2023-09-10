import { createActions } from '@lib/state-fx/store';

export interface InspectedWindowActions {
  InspectedWindowReloaded: void;
}

export const inspectedWindowActions = createActions<InspectedWindowActions>({
  namespace: 'InspectedWindow',
});
