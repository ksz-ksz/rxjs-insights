import { StoreComponent } from './store';
import { createStateSelector } from './selector';

export function createStoreSelector<TNamespace extends string, TState>(
  store: StoreComponent<TNamespace, TState>
) {
  const { namespace } = store;
  return createStateSelector(
    (state: { [K in TNamespace]: TState }) => state[namespace]
  );
}
