import { createStore } from '../store-lib';
import { reducer } from './reducer';
import { State } from './state';
import { effects } from './effects';

export const store = createStore<State>({
  initialState: {},
  reducer,
  effects,
});
