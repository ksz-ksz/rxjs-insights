import {
  Equals,
  Project,
  Selector,
  SelectorResults,
  SelectorStates,
} from '../selector';
import { StoreView } from '../store-view';
import { merge, Observable, Observer } from 'rxjs';
import { SelectOptions } from '../select-options';
import { createObserver } from './create-observer';

export class RecordSelector<
  DEPS extends Record<string, Selector<any, any>>,
  RESULT
> implements Selector<SelectorStates<DEPS>, RESULT>
{
  constructor(
    private readonly deps: DEPS,
    private readonly project: Project<Record<string, any>, RESULT>,
    private readonly equals: Equals<RESULT>
  ) {}

  select(
    store: StoreView<SelectorStates<DEPS>>,
    options?: SelectOptions
  ): StoreView<RESULT, any> {
    return new RecordSelection(
      this.getSelections(store),
      this.project,
      this.equals,
      options
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

class RecordSelection<STATE, EMITS>
  extends Observable<EMITS>
  implements StoreView<STATE, EMITS>
{
  private inputs!: Record<string, any>;
  private state!: STATE;

  constructor(
    private readonly deps: Record<string, StoreView<any>>,
    private readonly project: Project<Record<string, any>, STATE>,
    private readonly equals: Equals<STATE>,
    private readonly selectOptions: SelectOptions = {}
  ) {
    super((observer: Partial<Observer<EMITS>>) => {
      return merge(...this.getSources()).subscribe(
        createObserver(this as any, observer, this.selectOptions)
      );
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
    selector: Selector<STATE, DERIVED_STATE>,
    options?: SelectOptions
  ): StoreView<DERIVED_STATE, any> {
    return selector.select(this as any, options as any);
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
