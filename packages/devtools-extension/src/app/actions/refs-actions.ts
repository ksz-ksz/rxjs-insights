import { createActions } from '@lib/store';
import { PropertyRef } from '@app/protocols/refs';

export interface RefsActions {
  RefPropsLoaded: {
    refId: number;
    props: PropertyRef[];
  };
}

export const refsActions = createActions<RefsActions>('Refs');
