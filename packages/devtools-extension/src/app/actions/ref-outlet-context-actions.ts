import { createActions } from '@lib/store';
import { EventRef, TargetRef } from '@app/protocols/refs';

export interface RefOutletContextActions {
  FocusTarget: {
    target: TargetRef;
  };
  FocusEvent: {
    event: EventRef;
  };
}

export const refOutletContextActions =
  createActions<RefOutletContextActions>('RefOutletContext');
