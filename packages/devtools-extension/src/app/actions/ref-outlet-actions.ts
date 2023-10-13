import { GetterRef, Ref } from '@app/protocols/refs';
import { createActions } from '@lib/state-fx/store';

export interface RefOutletActions {
  Expand: { stateKey: string; path: string; ref: Ref };
  Collapse: { stateKey: string; path: string; ref: Ref };
  InvokeGetter: {
    stateKey: string;
    path: string;
    ref: GetterRef;
  };
}

export const refOutletActions = createActions<RefOutletActions>({
  namespace: 'RefOutlet',
});
