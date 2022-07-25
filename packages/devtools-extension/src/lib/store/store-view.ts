import { Observable } from 'rxjs';
import { Selector } from './selector';
import { SelectOptions } from './select-options';

export interface StoreView<STATE, EMITS = STATE> extends Observable<EMITS> {
  get(): STATE;
  select<RESULT>(
    selector: Selector<STATE, RESULT>,
    options: SelectOptions & { mode: 'push' }
  ): StoreView<RESULT>;
  select<RESULT>(
    selector: Selector<STATE, RESULT>,
    options: SelectOptions & { mode: 'pull' }
  ): StoreView<RESULT, void>;
  select<RESULT>(selector: Selector<STATE, RESULT>): StoreView<RESULT>;
  getSources(): Observable<unknown>[];
}
