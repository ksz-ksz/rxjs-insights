import { createActions } from '@lib/store';
import { ObservableState, SubscriberState } from '@app/store/insights';

export interface InsightsActions {
  ObservableStateLoaded: {
    state: ObservableState | undefined;
  };
  SubscriberStateLoaded: {
    state: SubscriberState | undefined;
  };
}

export const insightsActions =
  createActions<InsightsActions>('InsightsActions');
