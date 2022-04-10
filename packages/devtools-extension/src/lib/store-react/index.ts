import { Query, Store } from '@lib/store';
import { useContext, useEffect, useState, createContext } from 'react';
import { first } from 'rxjs';

const StoreContext = createContext<Store<any>>(undefined!);

export const StoreProvider = StoreContext.Provider;

export function useStore<STATE>(): Store<STATE> {
  return useContext(StoreContext);
}

export function useQuery<STATE, RESULT>(query: Query<STATE, RESULT>): RESULT {
  const store = useStore<STATE>();
  const [result, setResult] = useState<RESULT>(() => {
    let initialState: RESULT;
    store
      .query(query)
      .pipe(first())
      .subscribe({
        next(value) {
          initialState = value;
        },
        error(err) {
          throw err;
        },
      });
    return initialState!;
  });
  useEffect(() => {
    const subscription = store.query(query).subscribe({
      next(value) {
        setResult(value);
      },
      error(err) {
        throw err;
      },
    });

    return () => subscription.unsubscribe();
  }, [query]);
  return result;
}
