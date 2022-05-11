import { Slice } from './store';
import { ActionFactory } from './action';

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

export type SelectorFunction<S, R> = (state: S) => R;
export type SelectorFunctionState<F extends SelectorFunction<any, any>> =
  F extends SelectorFunction<infer S, any> ? S : never;
export type SelectorFunctionResult<F extends SelectorFunction<any, any>> =
  F extends SelectorFunction<any, infer R> ? R : never;

export type Selectors<
  SLICE extends string,
  SELECTORS extends Record<string, SelectorFunction<any, any>>
> = {
  [K in keyof SELECTORS]: Selector<
    Slice<SLICE, SelectorFunctionState<SELECTORS[K]>>,
    SelectorFunctionResult<SELECTORS[K]>
  >;
};

export function createSelectors<
  SLICE extends string,
  SELECTORS extends Record<string, SelectorFunction<any, any>>
>(slice: SLICE, selectors: SELECTORS): Selectors<SLICE, SELECTORS> {
  return Object.fromEntries(
    Object.entries(selectors).map(([k, v]) => [k, createSelector(v, slice)])
  ) as any;
}
