import { of, Subject, tap } from 'rxjs';
import { inspect } from '@rxjs-insights/devtools';
import { connect } from '@rxjs-insights/devtools/connect';

connect();

function sideEffectInTapTriggersSubjectNext() {
  const subject = new Subject<number>();
  const sub = of(1, 2, 3)
    .pipe(
      tap((x) => {
        subject.next(x);
      })
    )
    .subscribe(subscriber('A'));

  inspect(sub);
}

export function playground() {
  sideEffectInTapTriggersSubjectNext();
}

function subscriber(name: string) {
  return {
    next(value: any) {
      console.log(`${name}:next`, value);
    },
    error(error: any) {
      console.log(`${name}:error`, error);
    },
    complete() {
      console.log(`${name}:complete`);
    },
  };
}
