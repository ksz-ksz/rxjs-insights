import { ignoreElements, Observable, pipe, tap, UnaryFunction } from 'rxjs';

export function effect<T>(
  run: (value: T) => void
): UnaryFunction<Observable<T>, Observable<never>> {
  return pipe(tap(run), ignoreElements());
}
