import { Intersection } from './intersection';

export interface Selection<STATE, RESULT> {
  get(state: STATE): RESULT;
}

export interface Selector<STATE, RESULT> {
  selection(): Selection<STATE, RESULT>;
  select(state: STATE): RESULT;
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

class ProjectSelection<STATE, RESULT> implements Selection<STATE, RESULT> {
  private state!: STATE;
  private result!: RESULT;

  constructor(
    private readonly project: Project<STATE, RESULT>,
    private readonly equals: Equals<RESULT>
  ) {}

  get(state: STATE): RESULT {
    if (this.state === undefined) {
      this.state = state;
      this.result = this.project(state);
    } else if (this.state !== state) {
      this.state = state;
      const result = this.project(state);
      if (!this.equals(this.result, result)) {
        this.result = result;
      }
    }
    return this.result;
  }
}

class ProjectSelector<STATE, RESULT> implements Selector<STATE, RESULT> {
  constructor(
    private readonly project: Project<STATE, RESULT>,
    private readonly equals: Equals<RESULT>
  ) {}

  select(state: STATE): RESULT {
    return this.project(state);
  }

  selection(): Selection<STATE, RESULT> {
    return new ProjectSelection(this.project, this.equals);
  }
}

class TupleSelection<STATE, RESULT> implements Selection<STATE, RESULT> {
  private results!: any[];
  private result!: RESULT;

  constructor(
    private readonly deps: Selection<STATE, any>[],
    private readonly project: Project<any[], RESULT>,
    private readonly equals: Equals<RESULT>
  ) {}

  get(state: STATE): RESULT {
    const results = this.getResults(state);
    if (this.results === undefined) {
      this.results = results;
      this.result = this.project(this.results);
      return this.result;
    } else if (!this.areResultsEqual(this.results, results)) {
      this.results = results;
      const result = this.project(results);
      if (!this.equals(this.result, result)) {
        this.result = result;
      }
    }

    return this.result;
  }

  private getResults(state: STATE) {
    return this.deps.map((dep) => dep.get(state));
  }

  private areResultsEqual(as: any[], bs: any[]) {
    for (let i = 0; i < this.deps.length; i++) {
      if (as[i] !== bs[i]) {
        return false;
      }
    }

    return true;
  }
}

class TupleSelector<DEPS extends Selector<any, any>[], RESULT>
  implements Selector<SelectorStates<DEPS>, RESULT>
{
  constructor(
    private readonly deps: DEPS,
    private readonly project: Project<any[], RESULT>,
    private readonly equals: Equals<RESULT>
  ) {}

  select(state: SelectorStates<DEPS>): RESULT {
    return this.project(this.getResults(state));
  }

  selection(): Selection<SelectorStates<DEPS>, RESULT> {
    return new TupleSelection(this.getSelections(), this.project, this.equals);
  }

  private getResults(state: SelectorStates<DEPS>) {
    return this.deps.map((dep) => dep.select(state));
  }

  private getSelections(): Selection<any, any>[] {
    return this.deps.map((dep) => dep.selection());
  }
}

class RecordSelection<STATE, RESULT> implements Selection<STATE, RESULT> {
  private results!: Record<string, any>;
  private result!: RESULT;

  constructor(
    private readonly deps: Record<string, Selection<STATE, any>>,
    private readonly project: Project<Record<string, any>, RESULT>,
    private readonly equals: Equals<RESULT>
  ) {}

  get(state: STATE): RESULT {
    const results = this.getResults(state);
    if (this.results === undefined) {
      this.results = results;
      this.result = this.project(this.results);
      return this.result;
    } else if (!this.areResultsEqual(this.results, results)) {
      this.results = results;
      const result = this.project(results);
      if (!this.equals(this.result, result)) {
        this.result = result;
      }
    }

    return this.result;
  }

  private getResults(state: STATE) {
    const results: Record<string, any> = {};
    for (const [key, dep] of Object.entries(this.deps)) {
      results[key] = dep.get(state);
    }
    return results;
  }

  private areResultsEqual(as: Record<string, any>, bs: Record<string, any>) {
    for (const key of Object.keys(this.deps)) {
      if (as[key] !== bs[key]) {
        return false;
      }
    }

    return true;
  }
}

class RecordSelector<DEPS extends Record<string, Selector<any, any>>, RESULT>
  implements Selector<SelectorStates<DEPS>, RESULT>
{
  constructor(
    private readonly deps: DEPS,
    private readonly project: Project<Record<string, any>, RESULT>,
    private readonly equals: Equals<RESULT>
  ) {}

  select(state: SelectorStates<DEPS>): RESULT {
    return this.project(this.getResults(state));
  }

  selection(): Selection<SelectorStates<DEPS>, RESULT> {
    return new RecordSelection(this.getSelections(), this.project, this.equals);
  }

  private getResults(state: SelectorStates<DEPS>) {
    const results: Record<string, any> = {};
    for (const [key, dep] of Object.entries(this.deps)) {
      results[key] = dep.select(state);
    }
    return results;
  }

  private getSelections(): Record<string, Selection<any, any>> {
    const selections: Record<string, any> = {};
    for (const [key, dep] of Object.entries(this.deps)) {
      selections[key] = dep.selection();
    }
    return selections;
  }
}

function defaultProject<T>(state: T) {
  return state;
}

function defaultEquals<T>(a: T, b: T) {
  return a === b;
}
