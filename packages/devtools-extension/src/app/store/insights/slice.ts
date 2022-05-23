import { createReducer, Slice } from '@lib/store';
import { insightsActions } from '@app/actions/insights-actions';
import { ObservableInfo } from '@app/protocols/insights';

export interface ObservableState {
  info?: ObservableInfo;
}

export interface InsightsState {
  observables: Record<number, ObservableState>;
}

export type InsightsSlice = Slice<'insights', InsightsState>;

export const insightsReducer = createReducer('insights', {
  observables: {},
} as InsightsState).add(
  insightsActions.ObservableInfoLoaded,
  (state, action) => {
    const { info } = action.payload;
    if (info !== undefined) {
      state.observables[info.id] = state.observables[info.id] ?? {};
      state.observables[info.id].info = info;
    }
  }
);
