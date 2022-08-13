import { interval, map, zip } from 'rxjs';
import { inspect } from '@rxjs-insights/devtools';

export function fizzbuzz() {
  const number$ = interval(1000);
  const fizz$ = number$.pipe(map((n) => (n % 3 === 0 ? 'Fizz' : '')));
  const buzz$ = number$.pipe(map((n) => (n % 5 === 0 ? 'Buzz' : '')));
  const fizzbuzz$ = zip(fizz$, buzz$).pipe(
    map(([fizz, buzz]) => `${fizz}${buzz}`)
  );

  const fizzbuzzSubscription = fizzbuzz$.subscribe({
    next(fizzbuzz) {
      console.log(fizzbuzz);
    },
  });

  inspect(fizzbuzz$);
  inspect(fizzbuzzSubscription);
}
