import { createStore } from '@lib/store';
import { statusSlice } from './status';

export const store = createStore([statusSlice]);
