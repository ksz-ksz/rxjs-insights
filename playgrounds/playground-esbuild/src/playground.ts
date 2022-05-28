import { interval, map, of, take } from 'rxjs';
import { inspect } from '@rxjs-insights/console';

const inspectDevtools: typeof inspect = (window as any)
  .RXJS_ISNIGHTS_DEVTOOLS_INSPECT;

export function playground() {
  const obs = interval(1000).pipe(
    take(10),
    map((x) => x * x)
  );
  const sub = obs.subscribe(subscriber('A'));

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
