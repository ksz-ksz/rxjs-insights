import { createActions } from '@lib/store';
import { EventRef, TargetRef } from '@app/protocols/refs';
import { Location } from '@rxjs-insights/core';

export interface RefOutletContextActions {
  FocusTarget: {
    target: TargetRef;
  };
  FocusEvent: {
    event: EventRef;
  };
  OpenLocation: {
    location: Location;
  };
  InspectValueInConsole: {
    value: any;
  };
  StoreValueAsGlobalVariable: {
    value: any;
  };
  InspectObjectInConsole: {
    objectId: number;
  };
  StoreObjectAsGlobalVariable: {
    objectId: number;
  };
}

export const refOutletContextActions =
  createActions<RefOutletContextActions>('RefOutletContext');
