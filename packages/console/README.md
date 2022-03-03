# RxJS Insights Console Inspector

A simple inspector that displays the collected data in a readable form right in the browser console.

## API

### `install(name = '$insights')`

Exposes the inspector as a global variable (by default `$insights`). All of the following console inspector functions are then available via that variable.

Params:
- `name?: string` - the name of the global variable.

### `subscribers(target: Subscription | Observable)`

Shows the subscriber associated with the target `Subscription` or subscribers of the target `Observable`.

Params:
- `target: Subscription | OBservable` - the `Subscription` or `Observable` instance to inspect.

### `sources(target: Subscription | Observable)`

For the subscriber associated with the `Subscription` or for all subscribers of the `Observable` shows a tree of source subscribers, i.e. subscribers that sent an event to the succeeding subscriber.

Params:
- `target: Subscription | OBservable` - the `Subscription` or `Observable` instance to inspect.

### `destinations(target: Subscription | Observable)`

For the subscriber associated with the `Subscription` or for all subscribers of the `Observable` shows a tree of destination subscribers, i.e. subscribers that received an event from the preceding subscriber.

Params:
- `target: Subscription | OBservable` - the `Subscription` or `Observable` instance to inspect.

### `precedingEvents(target: Subscription | Observable)`

For each event of the subscriber associated with the `Subscription` or for all subscribers of the `Observable` shows a tree of events that precede given event.

Params:
- `target: Subscription | OBservable` - the `Subscription` or `Observable` instance to inspect.

### `succeedingEvents(target: Subscription | Observable)`

For each event of the subscriber associated with the `Subscription` or for all subscribers of the `Observable` shows a tree of events that succeed given event.

Params:
- `target: Subscription | OBservable` - the `Subscription` or `Observable` instance to inspect.

### `events(target: Subscription | Observable)`

For the subscriber associated with the `Subscription` or for all subscribers of the `Observable` shows events originating from given subscriber.

Params:
- `target: Subscription | OBservable` - the `Subscription` or `Observable` instance to inspect.

### `flow(target: Subscription | Observable)`

For the subscriber associated with the `Subscription` or for all subscribers of the `Observable` shows a time-ordered cascade of events that are directly or indirectly related to the events of the target subscriber(s).

Params:
- `target: Subscription | OBservable` - the `Subscription` or `Observable` instance to inspect.
