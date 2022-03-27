# Console usage

The `@rxjs-insights/console` package exports a few functions that allow to analyze the collected data.
Every function accepts a target `Observable` or `Subscription` as a parameter.

* **[stats](./docs/console/usage/stats.md)** - shows the statistics of the target, such as number of subscriptions, emitted notifications, etc.,
* **[subscribers](./docs/console/usage/subscribers.md)** - shows the subscriber(s) of the target,
* **[sources](./docs/console/usage/sources.md)** - shows the subscriber(s) of the target; for each subscriber shows the source subscriber tree,
* **[destinations](./docs/console/usage/destinations.md)** - shows the subscriber(s) of the target; for each subscriber shows the destination subscriber tree,
* **[events](./docs/console/usage/events.md)** - shows the events of the target,
* **[precedingEvents](./docs/console/usage/preceding-events.md)** - shows the events of the target; for each event shows the chain of events that triggered the given event,
* **[succeedingEvents](./docs/console/usage/succeeding-events.md)** - shows the events of the target; for each event shows the tree of events that were triggered by the given event,
* **[eventsFlow](./docs/console/usage/events-flow.md)** - shows an ordered tree of events related to the target events.

## Interactive exploration

RxJS Insights Console provides a somewhat interactive experience.
After calling an inspector function, for example `stats`, it's possible to perform other inspections by expanding the `More` object and invoking one of the getters.
By using the `More` object it's also possible to learn more about the target of the current log line (observable, subscriber or event).

![More getter invoked](./img/more-getter-invoked.png)
