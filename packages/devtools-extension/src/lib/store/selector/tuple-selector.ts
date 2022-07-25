import { Equals, Project, Selector, SelectorStates } from '../selector';
import { StoreView } from '../store-view';
import { SelectOptions } from '../select-options';
import { merge, Observable, Observer } from 'rxjs';
import { createObserver } from './create-observer';

export class TupleSelector<DEPS extends Selector<any, any>[], RESULT>
  implements Selector<SelectorStates<DEPS>, RESULT>
{
  constructor(
    private readonly deps: DEPS,
    private readonly project: Project<any[], RESULT>,
    private readonly equals: Equals<RESULT>
  ) {}

  select(
    store: StoreView<SelectorStates<DEPS>>,
    options?: SelectOptions
  ): StoreView<RESULT, any> {
    return new TupleSelection(
      this.getSelections(store),
      this.project,
      this.equals,
      options
    );
  }

  private getSelections(store: StoreView<SelectorStates<DEPS>>) {
    return this.deps.map((dep) => dep.select(store));
  }
}

class TupleSelection<STATE, EMITS>
  extends Observable<EMITS>
  implements StoreView<STATE, EMITS>
{
  private inputs!: any[];
  private state!: STATE;

  constructor(
    private readonly deps: StoreView<any>[],
    private readonly project: Project<any[], STATE>,
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
