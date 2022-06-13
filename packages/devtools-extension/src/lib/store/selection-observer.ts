import { Observer } from 'rxjs';
import { Selection } from './selector';

export class SelectionObserver<STATE, RESULT> implements Observer<STATE> {
  private lastResult: RESULT | undefined = undefined;

  constructor(
    private readonly selection: Selection<STATE, RESULT>,
    private readonly destination: Observer<RESULT>
  ) {}

  next(state: STATE): void {
    const result = this.selection.get(state);
    if (this.lastResult === undefined || this.lastResult !== result) {
      this.lastResult = result;
      this.destination.next(result);
    }
  }

  error(err: any): void {
    this.destination.error(err);
  }

  complete(): void {
    this.destination.complete();
  }
}
