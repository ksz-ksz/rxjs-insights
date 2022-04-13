import { Slice } from './store';

export interface Selector<STATE, RESULT> {
  select(state: STATE): RESULT;
}

export function createSelector<STATE, RESULT>(
  select: (state: STATE) => RESULT
): Selector<STATE, RESULT>;
export function createSelector<SLICE extends string, STATE, RESULT>(
  select: (state: STATE) => RESULT,
  slice: SLICE
): Selector<Slice<SLICE, STATE>, RESULT>;
export function createSelector(
  select: (state: any) => any,
  slice?: string
): Selector<any, any> {
  if (slice) {
    return {
      select: (state) => select(state[slice]),
    };
  } else {
    return {
      select,
    };
  }
}
