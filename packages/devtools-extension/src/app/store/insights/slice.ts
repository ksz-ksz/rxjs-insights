import { createReducer, Slice } from '@lib/store';
import { insightsActions } from '@app/actions/insights-actions';
import {
  ObservableState,
  Relations,
  SubscriberState,
} from '@app/protocols/insights';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';

export interface SubscriberUiState {
  expandedKeys: Set<string>;
  visibleKeys: Set<string>; // TODO: rename: expandedKeys
  visibleIds: Set<number>;
}

export interface InsightsState {
  time: number;
  playing: boolean;
  subscribersUi: Record<number, SubscriberUiState>;
  subscribers: Record<number, SubscriberState>;
  observables: Record<number, ObservableState>;
}

export type InsightsSlice = Slice<'insights', InsightsState>;

function expand(
  relations: Relations,
  keys: Set<string>,
  key: string,
  id: number
) {
  const target = relations.targets[id];
  target.sources?.forEach((childTarget) => {
    keys.add(`${key}.${childTarget}`);
  });
  target.destinations?.forEach((childTarget) => {
    keys.add(`${key}.${childTarget}`);
  });
}

function collapse(
  relations: Relations,
  keys: Set<string>,
  key: string,
  id: number
) {
  const target = relations.targets[id];
  target.sources?.forEach((childTarget) => {
    keys.delete(`${key}.${childTarget}`);
  });
  target.destinations?.forEach((childTarget) => {
    keys.delete(`${key}.${childTarget}`);
  });
}

function getIds(keysSet: Set<string>) {
  const expandedKeys = new Set<string>();
  const ids = new Set<number>();
  const keys = Array.from(keysSet).sort((a, b) => a.length - b.length);
  for (const key of keys) {
    const path = key.split('.');
    const id = path.pop();
    const parentKey = path.join('.');
    if (parentKey === '' || expandedKeys.has(parentKey)) {
      expandedKeys.add(key);
      ids.add(Number(id));
    }
  }
  return ids;
}

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
        expandedKeys: new Set(),
        visibleKeys: new Set([String(subscriberState.ref.id)]),
        visibleIds: new Set([subscriberState.ref.id]),
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
    const { key, id, target } = action.payload;
    const { relations } = state.subscribers[action.payload.target];
    const { visibleKeys, expandedKeys } =
      state.subscribersUi[action.payload.target];
    if (!expandedKeys.has(key)) {
      expandedKeys.add(key);
      expand(relations, visibleKeys, key, id);
    } else {
      expandedKeys.delete(key);
      collapse(relations, visibleKeys, key, id);
    }
    state.subscribersUi[target].visibleIds = getIds(visibleKeys);
  });
