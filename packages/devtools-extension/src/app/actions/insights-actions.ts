import { createActions } from '@lib/store';
import { ObservableRef, Ref, SubscriberRef } from '@app/protocols/refs';

export interface InsightsActions {
  ObservableRefLoaded: {
    ref: ObservableRef | undefined;
  };
  SubscriberRefLoaded: {
    ref: SubscriberRef | undefined;
  };
}

export const insightsActions =
  createActions<InsightsActions>('InsightsActions');
