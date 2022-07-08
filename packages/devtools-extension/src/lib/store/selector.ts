import { Intersection } from './intersection';
import { StoreView } from './store-view';
import { Observable, Observer, Unsubscribable } from 'rxjs';

export interface Selector<STATE, RESULT> {
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

class StoreViewObserver<STATE> implements Observer<unknown> {
  constructor(
    private readonly view: StoreView<STATE>,
    private readonly destination: Partial<Observer<STATE>>
  ) {}

  next(): void {
    this.destination.next?.(this.view.get());
  }

  error(err: any): void {
    this.destination.error?.(err);
  }

  complete(): void {
    this.destination.complete?.();
  }
}

class ProjectSelection<INPUT_STATE, STATE>
  extends Observable<STATE>
  implements StoreView<STATE>
{
  private input!: INPUT_STATE;
  private state!: STATE;

  constructor(
    private readonly dep: StoreView<INPUT_STATE>,
    private readonly project: Project<INPUT_STATE, STATE>,
    private readonly equals: Equals<STATE>
  ) {
    super((observer: Partial<Observer<STATE>>): Unsubscribable => {
      return this.dep.subscribe(new StoreViewObserver(this, observer));
    });
  }

  get(): STATE {
    const input = this.dep.get();
    if (this.input === undefined) {
      this.input = input;
      this.state = this.project(input);
    } else if (this.input !== input) {
      this.input = input;
      const state = this.project(input);
      if (!this.equals(this.state, state)) {
        this.state = state;
      }
    }
    return this.state;
  }

  select<OUTPUT_STATE>(
    selector: Selector<STATE, OUTPUT_STATE>
  ): StoreView<OUTPUT_STATE> {
    return selector.select(this);
  }

  getSources(): Observable<unknown>[] {
    return this.dep.getSources();
  }
}

class ProjectSelector<STATE, RESULT> implements Selector<STATE, RESULT> {
  constructor(
    private readonly project: Project<STATE, RESULT>,
    private readonly equals: Equals<RESULT>
  ) {}

  select(store: StoreView<STATE>) {
    return new ProjectSelection(store, this.project, this.equals);
  }
}

class TupleSelection<STATE>
  extends Observable<STATE>
  implements StoreView<STATE>
{
  private inputs!: any[];
  private state!: STATE;

  constructor(
    private readonly deps: StoreView<any>[],
    private readonly project: Project<any[], STATE>,
    private readonly equals: Equals<STATE>
  ) {
    super((observer: Partial<Observer<STATE>>) => {
      return this.deps[0].subscribe(new StoreViewObserver(this, observer));
    });
  }

  get(): STATE {
    const inputs = this.getInputs();
    if (this.inputs === undefined) {
      this.inputs = inputs;
      this.state = this.project(this.inputs);
      return this.state;
    } else if (!this.areInputsEqual(this.inputs, inputs)) {
      this.inputs = inputs;
      const result = this.project(inputs);
      if (!this.equals(this.state, result)) {
        this.state = result;
      }
    }

    return this.state;
  }

  select<DERIVED_STATE>(
    selector: Selector<STATE, DERIVED_STATE>
  ): StoreView<DERIVED_STATE> {
    return selector.select(this);
  }

  getSources(): Observable<unknown>[] {
    return Array.from(new Set(this.deps.flatMap((x) => x.getSources())));
  }

  private getInputs() {
    return this.deps.map((dep) => dep.get());
  }

  private areInputsEqual(as: any[], bs: any[]) {
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

  select(store: StoreView<SelectorStates<DEPS>>) {
    return new TupleSelection(
      this.getSelections(store),
      this.project,
      this.equals
    );
  }

  private getSelections(store: StoreView<SelectorStates<DEPS>>) {
    return this.deps.map((dep) => dep.select(store));
  }
}

class RecordSelection<STATE>
  extends Observable<STATE>
  implements StoreView<STATE>
{
  private inputs!: Record<string, any>;
  private state!: STATE;

  constructor(
    private readonly deps: Record<string, StoreView<any>>,
    private readonly project: Project<Record<string, any>, STATE>,
    private readonly equals: Equals<STATE>
  ) {
    super((observer: Partial<Observer<STATE>>) => {
      return this.deps[0].subscribe(new StoreViewObserver(this, observer));
    });
  }

  get(): STATE {
    const inputs = this.getInputs();
    if (this.inputs === undefined) {
      this.inputs = inputs;
      this.state = this.project(this.inputs);
      return this.state;
    } else if (!this.areInputsEqual(this.inputs, inputs)) {
      this.inputs = inputs;
      const result = this.project(inputs);
      if (!this.equals(this.state, result)) {
        this.state = result;
      }
    }

    return this.state;
  }

  select<DERIVED_STATE>(
    selector: Selector<STATE, DERIVED_STATE>
  ): StoreView<DERIVED_STATE> {
    return selector.select(this);
  }

  getSources(): Observable<unknown>[] {
    return Array.from(
      new Set(Object.values(this.deps).flatMap((x) => x.getSources()))
    );
  }

  private getInputs() {
    const results: Record<string, any> = {};
    for (const [key, dep] of Object.entries(this.deps)) {
      results[key] = dep.get();
    }
    return results;
  }

  private areInputsEqual(as: Record<string, any>, bs: Record<string, any>) {
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

  select(store: StoreView<SelectorStates<DEPS>>) {
    return new RecordSelection(
      this.getSelections(store),
      this.project,
      this.equals
    );
  }

  private getSelections(store: StoreView<SelectorStates<DEPS>>) {
    const selections: Record<string, any> = {};
    for (const [key, dep] of Object.entries(this.deps)) {
      selections[key] = dep.select(store);
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
