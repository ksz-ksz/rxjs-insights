import { PropertyRef, Ref } from '@app/protocols/refs';
import { createActions } from '@lib/state-fx/store';

export interface RefsActions {
  RefsForExpandedPathsLoaded: {
    stateKey: string;
    refs: Record<number, PropertyRef[]>;
  };

  RefForInvokedGetterLoaded: {
    stateKey: string;
    objectId: number;
    keyId: string;
    ref: Ref;
  };
}

export const refsActions = createActions<RefsActions>({ namespace: 'Refs' });
