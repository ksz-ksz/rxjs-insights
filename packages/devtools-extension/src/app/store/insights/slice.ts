import { createReducer, Slice } from '@lib/store';
import { insightsActions } from '@app/actions/insights-actions';
import { ObservableState, SubscriberState } from '@app/protocols/insights';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';

export interface SubscriberUiState {
  expandedKeys: Set<string>;
}

export interface InsightsState {
  time: number;
  playing: boolean;
  subscribersUi: Record<number, SubscriberUiState>;
  subscribers: Record<number, SubscriberState>;
  observables: Record<number, ObservableState>;
}

export type InsightsSlice = Slice<'insights', InsightsState>;

export const insightsReducer = createReducer('insights', {
  time: 0,
  playing: false,
  subscribersUi: {},
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
      state.subscribersUi[subscriberState.ref.id] = {
        expandedKeys: new Set([String(subscriberState.ref.id)]),
      };
    }
  })
  .add(eventsLogActions.EventSelected, (state, action) => {
    state.time = action.payload.event.time;
  })
  .add(insightsActions.PlayNextEvent, (state, action) => {
    state.time = action.payload.event.time;
  })
  .add(eventsLogActions.Play, (state) => {
    state.playing = true;
  })
  .add(eventsLogActions.Pause, (state) => {
    state.playing = false;
  })
  .add(insightsActions.PlayDone, (state) => {
    state.playing = false;
  })
  .add(subscribersGraphActions.Toggle, (state, action) => {
    const { key } = action.payload;
    const { expandedKeys } = state.subscribersUi[action.payload.target];
    if (!expandedKeys.has(key)) {
      expandedKeys.add(key);
    } else {
      expandedKeys.delete(key);
    }
  });
