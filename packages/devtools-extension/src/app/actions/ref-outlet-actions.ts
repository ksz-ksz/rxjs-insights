import { createActions } from '@lib/store';

export interface RefOutletActions {
  Expand: { refId: number };
  Collapse: { refId: number };
}

export const refOutletActions = createActions<RefOutletActions>('RefOutlet');
