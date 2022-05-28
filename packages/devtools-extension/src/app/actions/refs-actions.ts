import { createActions } from '@lib/store';
import { PropertyRef, Ref } from '@app/protocols/refs';

export interface RefsActions {
  RefChildrenLoaded: {
    refId: number;
    children:
      | {
          props: PropertyRef[];
          proto: Ref;
        }
      | {
          setEntries: Ref[];
          props: PropertyRef[];
          proto: Ref;
        }
      | {
          mapEntries: [Ref, Ref][];
          props: PropertyRef[];
          proto: Ref;
        };
  };
}

export const refsActions = createActions<RefsActions>('Refs');
