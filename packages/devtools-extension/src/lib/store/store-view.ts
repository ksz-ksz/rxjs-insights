import { Observable } from 'rxjs';
import { Selector } from './selector';

export interface StoreView<STATE> extends Observable<STATE> {
  get(): STATE;
  select<DERIVED_STATE>(
    selector: Selector<STATE, DERIVED_STATE>
  ): StoreView<DERIVED_STATE>;
  getSources(): Observable<unknown>[];
}
