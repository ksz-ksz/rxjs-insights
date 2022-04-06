# Console usage

The `@rxjs-insights/console` package exports a few functions that allow to analyze the collected data in the context of the target (`Observable` or `Subscription`).

## Interactive output

The analysis is presented in the form of the browser console output.
The output provides somewhat interactive experience allowing for drilling-down to other analysis and/or targets.
This is achieved by the presence of the `More` object at the end of every log line.
The drill-down can be performed by expanding the `More` object and invoking one of the inspection functions, e.g.:

![Interactive output example - inspection getter](./img/interactive-output.png)
![Interactive output example - inspection getter invoked](./img/interactive-output-clicked.png)

## Inspections

### `inspect(target: Observable | Subscription)`

Shows the detailed info about the target.

```ts
import { delay, of } from 'rxjs';
import { inspect } from '@rxjs-insights/console';

const subscription = of(1, 2, 3)
  .pipe(delay(100))
  .subscribe({
    complete() {
      // wait for the data to be collected
      queueMicrotask(() => inspect(subscription));
    },
  });
```

![inspect function example](./img/inspect.png)

### `inspectSubscribers(target: Observable | Subscription)`

Shows the subscriber(s) of the target.

```ts
import { delay, of } from 'rxjs';
import { inspectSubscribers } from '@rxjs-insights/console';

const subscription = of(1, 2, 3)
  .pipe(delay(100))
  .subscribe({
    complete() {
      // wait for the data to be collected
      queueMicrotask(() => inspectSubscribers(subscription));
    },
  });
```

![inspectSubscribers function example](./img/inspect-subscribers.png)

### `inspectSources(target: Observable | Subscription)`

Shows the subscriber(s) of the target; for each subscriber shows the source subscriber tree.

```ts
import { delay, of } from 'rxjs';
import { inspectSources } from '@rxjs-insights/console';

const subscription = of(1, 2, 3)
  .pipe(delay(100))
  .subscribe({
    complete() {
      // wait for the data to be collected
      queueMicrotask(() => inspectSources(subscription));
    },
  });
```

![inspectSources function example](./img/inspect-sources.png)

### `inspectDestinations(target: Observable | Subscription)`

Shows the subscriber(s) of the target; for each subscriber shows the destination subscriber tree.

```ts
import { delay, of } from 'rxjs';
import { inspectDestinations } from '@rxjs-insights/console';

const subscription = of(1, 2, 3)
  .pipe(delay(100))
  .subscribe({
    complete() {
      // wait for the data to be collected
      queueMicrotask(() => inspectDestinations(subscription));
    },
  });
```

![inspectDestinations function example](./img/inspect-destinations.png)

### `inspectEvents(target: Observable | Subscription)`

Shows the events of the target.

```ts
import { delay, of } from 'rxjs';
import { inspectEvents } from '@rxjs-insights/console';

const subscription = of(1, 2, 3)
  .pipe(delay(100))
  .subscribe({
    complete() {
      // wait for the data to be collected
      queueMicrotask(() => inspectEvents(subscription));
    },
  });
```

![inspectEvents function example](./img/inspect-events.png)

### `inspectPrecedingEvents(target: Observable | Subscription)`

Shows the events of the target; for each event shows the chain of events that triggered the given event.

```ts
import { delay, of } from 'rxjs';
import { inspectPrecedingEvents } from '@rxjs-insights/console';

const subscription = of(1, 2, 3)
  .pipe(delay(100))
  .subscribe({
    complete() {
      // wait for the data to be collected
      queueMicrotask(() => inspectPrecedingEvents(subscription));
    },
  });
```

![inspectPrecedingEvents function example](./img/inspect-preceding-events.png)

### `inspectSucceedingEvents(target: Observable | Subscription)`

Shows the events of the target; for each event shows the tree of events that were triggered by the given event.

```ts
import { delay, of } from 'rxjs';
import { inspectSucceedingEvents } from '@rxjs-insights/console';

const subscription = of(1, 2, 3)
  .pipe(delay(100))
  .subscribe({
    complete() {
      // wait for the data to be collected
      queueMicrotask(() => inspectSucceedingEvents(subscription));
    },
  });
```

![inspectSucceedingEvents function example](./img/inspect-succeeding-events.png)

### `inspectEventsFlow(target: Observable | Subscription)`

Shows an ordered tree of events related to the target events.

```ts
import { delay, of } from 'rxjs';
import { inspectEventsFlow } from '@rxjs-insights/console';

const subscription = of(1, 2, 3)
  .pipe(delay(100))
  .subscribe({
    complete() {
      // wait for the data to be collected
      queueMicrotask(() => inspectEventsFlow(subscription));
    },
  });
```

![inspectEventsFlow function example](./img/inspect-events-flow.png)
