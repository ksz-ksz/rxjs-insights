import { createReducer, On, Reducer } from './reducer';
import { createSliceSelector, Selector } from './selector';
import { Slice } from './store';

export function createSlice<SLICE extends string, STATE>(
  slice: SLICE,
  initialState: STATE,
  ons: On<STATE, any>[]
): {
  reducer: Reducer<SLICE, STATE>;
  selector: Selector<Slice<SLICE, STATE>, STATE>;
} {
  return {
    reducer: createReducer(slice, initialState, ons),
    selector: createSliceSelector(slice),
  };
}
