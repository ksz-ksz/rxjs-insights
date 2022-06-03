import { createReducer, Slice } from '@lib/store';
import { insightsActions } from '@app/actions/insights-actions';
import { ObservableRef, SubscriberRef } from '@app/protocols/refs';

export interface SubscriberState {
  ref?: SubscriberRef;
}

export interface ObservableState {
  ref?: ObservableRef;
}

export interface InsightsState {
  subscribers: Record<number, SubscriberState>;
  observables: Record<number, ObservableState>;
}

export type InsightsSlice = Slice<'insights', InsightsState>;

export const insightsReducer = createReducer('insights', {
  subscribers: {},
  observables: {},
} as InsightsState)
  .add(insightsActions.ObservableRefLoaded, (state, action) => {
    const { ref } = action.payload;
    if (ref !== undefined) {
      state.observables[ref.id] = state.observables[ref.id] ?? {};
      state.observables[ref.id].ref = ref;
    }
  })
  .add(insightsActions.SubscriberRefLoaded, (state, action) => {
    const { ref } = action.payload;
    if (ref !== undefined) {
      state.subscribers[ref.id] = state.subscribers[ref.id] ?? {};
      state.subscribers[ref.id].ref = ref;
    }
  });
