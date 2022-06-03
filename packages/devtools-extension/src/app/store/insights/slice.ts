import { createReducer, Slice } from '@lib/store';
import { insightsActions } from '@app/actions/insights-actions';
import { ObservableState, SubscriberState } from '@app/protocols/insights';

export interface InsightsState {
  subscribers: Record<number, SubscriberState>;
  observables: Record<number, ObservableState>;
}

export type InsightsSlice = Slice<'insights', InsightsState>;

export const insightsReducer = createReducer('insights', {
  subscribers: {},
  observables: {},
} as InsightsState)
  .add(insightsActions.ObservableStateLoaded, (state, action) => {
    const { state: observableState } = action.payload;
    if (observableState !== undefined) {
      state.observables[observableState.ref.id] = observableState;
    }
  })
  .add(insightsActions.SubscriberStateLoaded, (state, action) => {
    const { state: subscriberState } = action.payload;
    if (subscriberState !== undefined) {
      state.subscribers[subscriberState.ref.id] = subscriberState;
    }
  });
