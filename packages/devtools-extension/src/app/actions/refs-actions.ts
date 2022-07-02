import { createActions } from '@lib/store';
import { PropertyRef, Ref } from '@app/protocols/refs';

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

export const refsActions = createActions<RefsActions>('Refs');
