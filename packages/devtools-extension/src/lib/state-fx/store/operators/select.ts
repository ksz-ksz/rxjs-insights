import { createSelectorFunction, Selector } from '@lib/state-fx/store';
import { map, Observable, OperatorFunction } from 'rxjs';

export function select<TState, TArgs extends any[], TResult>(
  selector: Selector<TState, TArgs, TResult>,
  ...args: TArgs
): OperatorFunction<TState, TResult> {
  return (source: Observable<TState>) =>
    new Observable((observer) => {
      const fn = createSelectorFunction(selector);

      return source
        .pipe(map((state) => fn(state, ...args)))
        .subscribe(observer);
    });
}
