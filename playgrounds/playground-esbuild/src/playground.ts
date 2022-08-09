import { interval, of, publish, refCount, Subject, take, tap } from 'rxjs';
import { inspect } from '@rxjs-insights/devtools';
import { connect } from '@rxjs-insights/devtools/connect';

connect();

function sideEffectInTapTriggersSubjectNext() {
  const subject = new Subject<number>();

  subject.subscribe(subscriber('X'));
  subject.subscribe(subscriber('Y'));

  const sub = of(1, 2, 3)
    .pipe(
      tap((x) => {
        subject.next(x);
      })
    )
    .subscribe(subscriber('A'));

  inspect(sub);
}

function publishWithRefCount() {
  const obs = interval(500).pipe(publish(), refCount());
  const subA = obs.subscribe(subscriber('A'));
  const subB = obs.subscribe(subscriber('B'));

  setTimeout(() => {
    subA.unsubscribe();
  }, 1000);

  setTimeout(() => {
    subB.unsubscribe();
  }, 2000);

  setTimeout(() => {
    const subC = obs.pipe(take(4)).subscribe(subscriber('C'));
  }, 3000);

  inspect(subA);
  inspect(subB);
}

export function playground() {
  sideEffectInTapTriggersSubjectNext();
  publishWithRefCount();
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
