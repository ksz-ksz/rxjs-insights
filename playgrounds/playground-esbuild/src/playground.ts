import {
  EMPTY,
  expand,
  from,
  interval,
  Observable,
  of,
  publish,
  refCount,
  share,
  Subject,
  take,
  tap,
} from 'rxjs';
import { inspect } from '@rxjs-insights/devtools';
import { connect } from '@rxjs-insights/devtools/connect';

connect();

function sideEffectInTapTriggersSubjectNextExample() {
  const subject = new Subject<number>();

  subject.asObservable().subscribe(subscriber('X'));
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

function publishWithRefCountExample() {
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

function shareExample() {
  const obs = interval(500).pipe(share());
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

function expandExample() {
  const obs = from('hello').pipe(
    expand((x) => (x.startsWith('expand ->') ? EMPTY : of(`expand -> ${x}`))),
    take(42)
  );
  const subA = obs.subscribe(subscriber('A'));

  inspect(subA);
}

export function playground() {
  sideEffectInTapTriggersSubjectNextExample();
  publishWithRefCountExample();
  shareExample();
  expandExample();
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
