import { Observable, Observer, Unsubscribable } from 'rxjs';
import { StoreView } from '../store-view';
import { Equals, Project, Selector } from '../selector';
import { SelectOptions } from '../select-options';
import { createObserver } from './create-observer';

export class ProjectSelector<STATE, RESULT> implements Selector<STATE, RESULT> {
  constructor(
    private readonly project: Project<STATE, RESULT>,
    private readonly equals: Equals<RESULT>
  ) {}

  select(
    store: StoreView<STATE>,
    options?: SelectOptions
  ): StoreView<RESULT, any> {
    return new ProjectSelection(store, this.project, this.equals, options);
  }
}

class ProjectSelection<INPUT_STATE, STATE, EMITS>
  extends Observable<EMITS>
  implements StoreView<STATE, EMITS>
{
  private input!: INPUT_STATE;
  private state!: STATE;

  constructor(
    private readonly dep: StoreView<INPUT_STATE>,
    private readonly project: Project<INPUT_STATE, STATE>,
    private readonly equals: Equals<STATE>,
    private readonly selectOptions: SelectOptions = {}
  ) {
    super((observer: Partial<Observer<EMITS>>): Unsubscribable => {
      return this.dep.subscribe(
        createObserver(this as any, observer, this.selectOptions)
      );
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
    selector: Selector<STATE, OUTPUT_STATE>,
    options?: SelectOptions
  ): StoreView<OUTPUT_STATE, any> {
    return selector.select(this as any, options as any);
  }

  getSources(): Observable<unknown>[] {
    return this.dep.getSources();
  }
}
