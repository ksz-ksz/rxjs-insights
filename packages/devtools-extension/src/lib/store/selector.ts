import { Slice, SliceName, SliceState } from './store';
import { Intersection } from './intersection';

export interface Selector<STATE, RESULT> {
  select(state: STATE): RESULT;
}

export type SelectorResult<SELECTOR extends Selector<any, any>> =
  SELECTOR extends Selector<any, infer RESULT> ? RESULT : never;

export type SelectorState<SELECTOR extends Selector<any, any>> =
  SELECTOR extends Selector<infer STATE, any> ? STATE : never;

export type RecordDeps = Record<string, Selector<any, any>>;

export type TupleDeps = readonly Selector<any, any>[];

export type Deps = RecordDeps | TupleDeps;

export type RecordDepsResults<DEPS extends RecordDeps> = {
  [K in keyof DEPS]: SelectorResult<DEPS[K]>;
};

export type TupleDepsResults<DEPS extends TupleDeps> = {
  [K in keyof DEPS]: DEPS[K] extends Selector<any, any>
    ? SelectorResult<DEPS[K]>
    : never;
};

export type DepsResults<DEPS extends Deps> = DEPS extends RecordDeps
  ? RecordDepsResults<DEPS>
  : DEPS extends TupleDeps
  ? TupleDepsResults<DEPS>
  : never;

export type RecordDepsStates<DEPS extends RecordDeps> = Intersection<
  SelectorState<DEPS[keyof DEPS]>
>;

export type TupleDepsStates<DEPS extends TupleDeps> = Intersection<
  SelectorState<DEPS[number]>
>;

export type DepsStates<DEPS extends Deps> = DEPS extends RecordDeps
  ? RecordDepsStates<DEPS>
  : DEPS extends TupleDeps
  ? TupleDepsStates<DEPS>
  : never;

export function createSliceSelector<SLICE extends string, STATE>(
  slice: SLICE
): Selector<Slice<SLICE, STATE>, STATE> {
  return {
    select(state: Slice<SLICE, STATE>): STATE {
      return state[slice];
    },
  };
}

export function createSelector<DEPS extends Deps, RESULT>(
  deps: DEPS,
  select: (deps: DepsResults<DEPS>) => RESULT
): Selector<DepsStates<DEPS>, RESULT> {
  return Array.isArray(deps)
    ? {
        select(state: DepsStates<DEPS>): RESULT {
          return select(
            deps.map((dep: Selector<any, any>) =>
              dep.select(state)
            ) as unknown as DepsResults<DEPS>
          );
        },
      }
    : {
        select(state: DepsStates<DEPS>): RESULT {
          return select(
            Object.fromEntries(
              Object.entries(deps).map(([key, dep]) => [key, dep.select(state)])
            ) as unknown as DepsResults<DEPS>
          );
        },
      };
}
