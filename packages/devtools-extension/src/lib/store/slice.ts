import { Reducer } from './reducer';
import { Effect } from './effect';

export interface Slice<NAME extends string, STATE> {
  name: NAME;
  initialState: STATE;
  reducer: Reducer<STATE>;
  effects: Effect[];
}

export type HasSlice<NAME extends string, STATE> = {
  [K in NAME]: STATE;
};
