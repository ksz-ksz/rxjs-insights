import { createActions } from '@lib/store';
import { GetterRef, Ref } from '@app/protocols/refs';

export interface RefOutletActions {
  Expand: { stateKey: string; path: string; ref: Ref };
  Collapse: { stateKey: string; path: string; ref: Ref };
  InvokeGetter: {
    stateKey: string;
    path: string;
    ref: GetterRef;
  };
}

export const refOutletActions = createActions<RefOutletActions>('RefOutlet');
