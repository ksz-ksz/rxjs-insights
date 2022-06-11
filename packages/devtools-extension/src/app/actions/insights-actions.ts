import { createActions } from '@lib/store';
import { ObservableState, SubscriberState } from '@app/store/insights';
import { RelatedEvent } from '@app/protocols/insights';

export interface InsightsActions {
  ObservableStateLoaded: {
    state: ObservableState | undefined;
  };
  SubscriberStateLoaded: {
    state: SubscriberState | undefined;
  };
  PlayNextEvent: {
    event: RelatedEvent;
  };
  PlayDone: void;
}

export const insightsActions =
  createActions<InsightsActions>('InsightsActions');
