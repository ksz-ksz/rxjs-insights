import {
  delay,
  EMPTY,
  expand,
  filter,
  firstValueFrom,
  from,
  interval,
  lastValueFrom,
  map,
  of,
  pipe,
  publish,
  refCount,
  share,
  startWith,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { inspect } from '@rxjs-insights/devtools';
import { declareOperator } from '@rxjs-insights/core/declarations';
import { internal, tag } from '@rxjs-insights/core/operators';

function updateSubjectInSubscribeExample() {
  const subject = new Subject<number>();

  subject.asObservable().subscribe((x) => {
    console.log('subject', x);
  });

  const sub = of(1, 2, 3)
    .pipe(
      tap((x) => {
        subject.next(x);
      })
    )
    .subscribe((x) => {
      subject.next(x);
    });

  inspect(sub);
}

function updateSubjectInTapExample() {
  const subject = new Subject<number>();

  subject.asObservable().subscribe(subscriber('X'));
  subject
    .pipe(take(3))
    .toPromise()
    .then((x) => console.log('promise', x));

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

function promiseExample() {
  const obs = interval(100).pipe(take(3));
  obs.toPromise().then((x) => console.log('toPromise', x));
  firstValueFrom(obs).then((x) => console.log('firstValueFrom', x));
  lastValueFrom(obs).then((x) => console.log('lastValueFrom', x));

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

function longStackExample() {
  const obs = interval(1000).pipe(
    switchMap((x) => of(x, x).pipe(switchMap((y) => of(x, y, x, y)))),
    take(42)
  );

  const sub = obs.subscribe(subscriber('A'));
  inspect(sub);
}

function internalExample() {
  const operator = declareOperator(
    () =>
      pipe(
        filter((x: number) => x % 2 === 0),
        internal(),
        map((x: number) => x * x),
        internal(),
        take(10)
      ),
    'operator'
  );

  const obs = interval(100).pipe(operator());
  const sub = obs.subscribe(subscriber('A'));

  inspect(sub);
}

function tagExample() {
  const obs = interval(100).pipe(
    filter((x: number) => x % 2 === 0),
    tag('F'),
    tag('I'),
    tag('L'),
    map((x: number) => x * x),
    tag('M'),
    take(10),
    tag('T')
  );
  const sub = obs.subscribe(subscriber('A'));

  inspect(sub);
}

export function playground() {
  // updateSubjectInTapExample();
  // updateSubjectInSubscribeExample();
  // publishWithRefCountExample();
  // shareExample();
  // expandExample();
  // promiseExample();
  // cycleExample();
  // fizzbuzz();
  // subjects();
  // longStackExample();
  internalExample();
  tagExample();
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
