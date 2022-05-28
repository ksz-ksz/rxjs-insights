import { createActions } from '@lib/store';
import { PropertyRef, Ref } from '@app/protocols/refs';

export interface RefsActions {
  PropsLoaded: {
    refId: number;
    props: PropertyRef[];
  };

  RefLoaded: {
    refId: number;
    ref: Ref;
  };
}

export const refsActions = createActions<RefsActions>('Refs');
