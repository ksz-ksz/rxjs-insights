import { of } from 'rxjs';
import { inspect } from '@rxjs-insights/console';

export function playground() {
  const obs = of(1, 2, 3);
  const sub = obs.subscribe(subscriber('A'));

  setTimeout(() => {
    inspect(obs);
    inspect(sub);
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
