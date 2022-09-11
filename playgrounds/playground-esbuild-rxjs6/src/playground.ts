import { EMPTY, from, interval, of, Subject } from 'rxjs';
import { inspect } from '@rxjs-insights/devtools';
import {
  delay,
  expand,
  publish,
  refCount,
  share,
  startWith,
  take,
} from 'rxjs/operators';
import { tag } from '@rxjs-insights/core/operators';

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
  const obs = interval(500).pipe(tag('asd'), share());
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

function promiseExample() {
  const obs = interval(100).pipe(take(3));
  obs.toPromise().then((x) => console.log('toPromise', x));

  inspect(obs);
}

function cycleExample() {
  const subject = new Subject();
  subject
    .asObservable()
    .pipe(startWith('woohoo'), delay(1000), take(42))
    .subscribe(subject);

  inspect(subject);
}

function subjects() {
  const subject = new Subject<number>();

  subject.subscribe((value) => {
    if (value > 0) {
      subject.next(-value);
    }
  });

  subject.next(1);
  inspect(subject);
}

export function playground() {
  // updateSubjectInTapExample();
  // updateSubjectInSubscribeExample();
  // publishWithRefCountExample();
  shareExample();
  // expandExample();
  // promiseExample();
  // cycleExample();
  // fizzbuzz();
  // subjects();
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
