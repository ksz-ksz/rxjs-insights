import {
  asapScheduler,
  asyncScheduler,
  delay,
  interval,
  map,
  merge,
  Observable,
  observeOn,
  of,
  scheduled,
  share,
  Subject,
  switchMap,
  take,
} from 'rxjs';
import { inspect } from '@rxjs-insights/console';

const inspectDevtools: typeof inspect =
  (window as any).RXJS_ISNIGHTS_DEVTOOLS_INSPECT ?? inspect;

export function playground() {
  const obs1 = scheduled([of('a', 'b'), of(1, 2)], asapScheduler).pipe(
    map((x) => x),
    switchMap((x) => x),
    (source) =>
      new Observable((observer) => {
        const subscription = source.subscribe(observer);
        inspectDevtools(subscription);
        return subscription;
      }),
    share()
  );
  const subject = new Subject();
  const obs = merge(obs1, subject);
  const sub = obs.pipe(delay(1000), delay(1000), take(10)).subscribe(subject);

  subject.next('woohoo');

  setTimeout(() => {
    inspect(obs);
    inspect(sub);
    inspectDevtools(obs);
    inspectDevtools(sub);
  }, 1000);

  setTimeout(() => {
    const button = document.createElement('button');
    button.textContent = 'run';
    button.addEventListener('click', () => {
      playground();
    });

    document.body.appendChild(button);
  }, 0);
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
