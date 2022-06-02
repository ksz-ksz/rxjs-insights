import { createReducer, Slice } from '@lib/store';
import { insightsActions } from '@app/actions/insights-actions';
import { Ref } from '@app/protocols/refs';

export interface ObservableState {
  ref?: Ref;
}

export interface InsightsState {
  observables: Record<number, ObservableState>;
}

export type InsightsSlice = Slice<'insights', InsightsState>;

export const insightsReducer = createReducer('insights', {
  observables: {},
} as InsightsState).add(
  insightsActions.ObservableRefLoaded,
  (state, action) => {
    const { ref } = action.payload;
    if (ref !== undefined) {
      state.observables[ref.id] = state.observables[ref.id] ?? {};
      state.observables[ref.id].ref = ref;
    }
  }
);
