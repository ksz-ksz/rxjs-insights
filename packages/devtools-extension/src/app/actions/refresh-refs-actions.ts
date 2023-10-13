import { Ref } from '@app/protocols/refs';
import { createActions } from '@lib/state-fx/store';

export interface RefreshRefsActions {
  LoadExpanded: {
    ref: Ref;
    stateKey: string;
    path: string;
  };

  Refresh: {
    ref: Ref;
    stateKey: string;
    path: string;
  };
}

export const refreshRefsActions = createActions<RefreshRefsActions>({
  namespace: 'RefreshRefsActions',
});
