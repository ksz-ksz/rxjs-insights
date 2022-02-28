import { delay, map, Subject } from 'rxjs';
import {
  destinations,
  events,
  flow,
  instances,
  precedingEvents,
  sources,
  succeedingEvents,
} from '@rxjs-insights/console';

export function playground() {
  // const subject1 = new Subject();
  // const subject2 = new Subject();
  //
  // flow(subject1.subscribe());
  // flow(subject2.subscribe());
  //
  // const observable = combineLatest([subject1, subject2]).pipe(map((x) => x));
  //
  // const sub = observable.pipe(tap(console.log)).subscribe();
  //
  // subject1.next(1);
  // subject2.next('a');
  // subject1.next(2);
  // subject2.next('b');

  const subject = new Subject<number>();
  subject.subscribe();
  subject.subscribe();
  subject.subscribe();
  subject
    .pipe(
      delay(1000),
      map((x) => x + 1)
    )
    .subscribe(subject);

  subject.subscribe();
  subject.subscribe();
  subject.subscribe();

  subject.next(0);

  const observable = subject;

  // const subject = new Subject();
  //
  // const sub1 = subject.subscribe(subscriber('1'));
  // const o1 = new Observable((o) => o.next(1));
  // o1.subscribe(subject).unsubscribe();
  // // sub1.unsubscribe();
  //
  // const sub2 = subject.subscribe(subscriber('2'));
  // const o2 = new Observable((o) => o.next(2));
  // o2.subscribe(subject).unsubscribe();
  // // sub2.unsubscribe();

  setTimeout(() => {
    flow(observable);
    instances(observable);
    sources(observable);
    destinations(observable);
    events(observable);
    precedingEvents(observable);
    succeedingEvents(observable);
  }, 1000);
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
