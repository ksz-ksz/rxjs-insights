# Console usage

The `@rxjs-insights/console` package exports a few functions that allow to analyze the collected data.
Every function accepts a target `Observable` or `Subscription` as a parameter.

* **[inspect](./docs/console/usage/info.md)** - shows the detailed info about the target,
* **[inspectSubscribers](./docs/console/usage/subscribers.md)** - shows the subscriber(s) of the target,
* **[inspectSources](./docs/console/usage/sources.md)** - shows the subscriber(s) of the target; for each subscriber shows the source subscriber tree,
* **[inspectDestinations](./docs/console/usage/destinations.md)** - shows the subscriber(s) of the target; for each subscriber shows the destination subscriber tree,
* **[inspectEvents](./docs/console/usage/events.md)** - shows the events of the target,
* **[inspectPrecedingEvents](./docs/console/usage/preceding-events.md)** - shows the events of the target; for each event shows the chain of events that triggered the given event,
* **[inspectSucceedingEvents](./docs/console/usage/succeeding-events.md)** - shows the events of the target; for each event shows the tree of events that were triggered by the given event,
* **[inspectEventsFlow](./docs/console/usage/events-flow.md)** - shows an ordered tree of events related to the target events.

## Interactive exploration

RxJS Insights Console provides a somewhat interactive experience.
After calling an inspector function, for example `inspect`, it's possible to perform other inspections by expanding the `More` object and invoking one of the `inspect *` getters.
By using the `More` object it's also possible to learn more about the target of the current log line (observable, subscriber or event).

![More getter invoked](./img/more-getter-invoked.png)
