# Console usage

The `@rxjs-insights/console` package exports a few functions that allow to analyze the collected data in the context of the target (`Observable` or `Subscription`).

## Interactive output

The analysis is presented in the form of the browser console output.
Moreover, the output provides somewhat interactive experience allowing for drilling-down to other analysis and/or targets.
This is achieved by the presence of the `More` object at the end of every log line.
The drill-down can be performed by expanding the `More` object and invoking one of the inspection functions, e.g.:

![Interactive output example](./img/interactive-output.png)

## Inspections

### `inspect(target: Observable | Subscription)`

Shows the detailed info about the target.

### `inspectSubscribers(target: Observable | Subscription)`

Shows the subscriber(s) of the target.

### `inspectSources(target: Observable | Subscription)`

Shows the subscriber(s) of the target; for each subscriber shows the source subscriber tree.

### `inspectDestinations(target: Observable | Subscription)`

Shows the subscriber(s) of the target; for each subscriber shows the destination subscriber tree.

### `inspectEvents(target: Observable | Subscription)`

Shows the events of the target.

### `inspectPrecedingEvents(target: Observable | Subscription)`

Shows the events of the target; for each event shows the chain of events that triggered the given event.

### `inspectSucceedingEvents(target: Observable | Subscription)`

Shows the events of the target; for each event shows the tree of events that were triggered by the given event.

### `inspectEventsFlow(target: Observable | Subscription)`

Shows an ordered tree of events related to the target events.
