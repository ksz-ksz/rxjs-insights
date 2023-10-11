import { SelectorFunction } from '@lib/state-fx/store';
import { RouterState } from './router-store';

export interface RouterSelectors<TNamespace extends string> {
  selectState: SelectorFunction<
    Record<TNamespace, RouterState>,
    [],
    RouterState
  >;
}
