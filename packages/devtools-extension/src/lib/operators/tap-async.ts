import { MonoTypeOperatorFunction, Observable } from 'rxjs';

export function tapAsync<T>(
  next?: (value: T) => Promise<void>,
  error?: (error: any) => Promise<void>,
  complete?: () => Promise<void>
): MonoTypeOperatorFunction<T> {
  return (source) =>
    new Observable<T>((observer) => {
      source.subscribe({
        next: next
          ? (value) => {
              next(value).then(() => observer.next(value));
            }
          : (value) => {
              observer.next(value);
            },
        error: error
          ? (err) => {
              error(err).then(() => observer.error(err));
            }
          : (err) => {
              observer.error(err);
            },
        complete: complete
          ? () => {
              complete().then(() => observer.complete());
            }
          : () => {
              observer.complete();
            },
      });
    });
}
