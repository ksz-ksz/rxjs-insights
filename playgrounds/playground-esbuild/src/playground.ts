import {
  asapScheduler,
  delay,
  map,
  merge,
  NEVER,
  Observable,
  of,
  scheduled,
  share,
  Subject,
  switchMap,
  take,
} from 'rxjs';
import { inspect } from '@rxjs-insights/devtools';
import { connect } from '@rxjs-insights/devtools/connect';

connect();

export function playground() {
  const obs1 = scheduled([of('a', 'b'), of(1, 2)], asapScheduler).pipe(
    map((x) => x),
    switchMap((x) => x),
    inspect,
    share()
  );
  const subject = new Subject();
  const obs = merge(obs1, obs1, subject, NEVER);
  const sub = obs.pipe(delay(0), take(10)).subscribe(subject);
  obs.subscribe(subscriber('a'));

  subject.next('woohoo');

  setTimeout(() => {
    inspect(obs);
    inspect(sub);
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
