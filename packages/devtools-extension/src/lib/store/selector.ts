import { Intersection } from './intersection';
import { StoreView } from './store-view';
import { SelectOptions } from './select-options';
import { ProjectSelector } from './selector/project-selector';
import { TupleSelector } from './selector/tuple-selector';
import { RecordSelector } from './selector/record-selector';

export interface Selector<STATE, RESULT> {
  select(
    store: StoreView<STATE>,
    options: SelectOptions & { mode: 'push' }
  ): StoreView<RESULT>;
  select(
    store: StoreView<STATE>,
    options: SelectOptions & { mode: 'pull' }
  ): StoreView<RESULT, void>;
  select(store: StoreView<STATE>): StoreView<RESULT>;
}

export type SelectorState<SELECTOR> = SELECTOR extends Selector<
  infer STATE,
  any
>
  ? STATE
  : never;

export type SelectorResult<SELECTOR> = SELECTOR extends Selector<
  any,
  infer RESULT
>
  ? RESULT
  : never;

export type SelectorResults<T> = {
  [K in keyof T]: SelectorResult<T[K]>;
};

export type SelectorStates<T> = Intersection<SelectorState<T[keyof T]>>;

export interface Project<T, U> {
  (a: T): U;
}

export interface Equals<T> {
  (a: T, b: T): boolean;
}

export function createSelector<STATE, RESULT>(
  project: Project<STATE, RESULT>,
  equals?: Equals<RESULT>
): Selector<STATE, RESULT>;

export function createSelector<
  DEPS extends Record<string, Selector<any, any>>,
  RESULT
>(
  deps: DEPS,
  project: Project<SelectorResults<DEPS>, RESULT>,
  equals?: Equals<RESULT>
): Selector<SelectorStates<DEPS>, RESULT>;

export function createSelector<
  DEPS extends Record<string, Selector<any, any>>,
  RESULT
>(deps: DEPS): Selector<SelectorStates<DEPS>, SelectorResults<DEPS>>;

export function createSelector<DEPS extends Selector<any, any>[], RESULT>(
  deps: [...DEPS],
  project: Project<SelectorResults<DEPS>, RESULT>,
  equals?: Equals<RESULT>
): Selector<SelectorStates<DEPS>, RESULT>;

export function createSelector<DEPS extends Selector<any, any>[], RESULT>(
  deps: [...DEPS]
): Selector<SelectorStates<DEPS>, SelectorResults<DEPS>>;

export function createSelector(
  depsOrProject: any,
  projectOrEquals?: any,
  equals?: any
): any {
  if (typeof depsOrProject === 'function') {
    return new ProjectSelector(depsOrProject, projectOrEquals ?? defaultEquals);
  } else if (Array.isArray(depsOrProject)) {
    return new TupleSelector(
      depsOrProject,
      projectOrEquals ?? defaultProject,
      equals ?? defaultEquals
    );
  } else {
    return new RecordSelector(
      depsOrProject,
      projectOrEquals ?? defaultProject,
      equals ?? defaultEquals
    );
  }
}

function defaultProject<T>(state: T) {
  return state;
}

function defaultEquals<T>(a: T, b: T) {
  return a === b;
}
