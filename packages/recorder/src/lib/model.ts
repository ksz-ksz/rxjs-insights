import {
  DeclarationRef,
  Locations,
  ObservableEventRef,
  ObservableRef,
  SubscriberEventRef,
  SubscriberRef,
} from '@rxjs-insights/instrumentation';

export class Declaration {
  private static IDS = 0;

  readonly id = Declaration.IDS++;

  constructor(
    readonly name: string,
    readonly func?: Function,
    readonly args?: any[],
    public locations: Locations = {}
  ) {}
}

export class Observable {
  private static IDS = 0;

  readonly id = Observable.IDS++;

  constructor(
    readonly declaration: Declaration,
    readonly sourceObservable?: Observable,
    readonly subscribers: Subscriber[] = [],
    readonly events: ObservableEvent[] = []
  ) {}

  get name() {
    return this.declaration.name;
  }
}

export class Subscriber {
  private static IDS = 0;

  readonly id = Subscriber.IDS++;

  constructor(
    readonly observable: Observable,
    readonly destinationObservable: Observable | undefined,
    readonly events: SubscriberEvent[] = []
  ) {}

  get name() {
    return `${this.observable.name} → ${
      this.destinationObservable !== undefined
        ? this.destinationObservable.name
        : 'subscribe'
    }`;
  }
}

export abstract class Event {
  private static TIME = 0;

  readonly time = Event.TIME++;
  readonly timestamp = Date.now();

  protected constructor(
    readonly declaration: Declaration,
    readonly task: Task,
    readonly precedingEvent?: Event,
    readonly succeedingEvents: Event[] = []
  ) {}

  get name() {
    return this.declaration.name;
  }

  get data() {
    return this.declaration.args?.[0] ?? undefined;
  }

  hasData() {
    return this.declaration.args?.length ?? 0 !== 0;
  }

  isSubscriptionEvent() {
    return this.name === 'subscribe' || this.name === 'unsubscribe';
  }

  isNotificationEvent() {
    return (
      this.name === 'next' || this.name === 'error' || this.name === 'complete'
    );
  }

  getPrecedingEvents() {
    return this.precedingEvent ? [this.precedingEvent] : [];
  }

  getSucceedingEvents() {
    return this.succeedingEvents;
  }

  getSourceEvents() {
    return this.isSubscriptionEvent()
      ? this.getSucceedingEvents()
      : this.getPrecedingEvents();
  }

  getDestinationEvents() {
    return this.isSubscriptionEvent()
      ? this.getPrecedingEvents()
      : this.getSucceedingEvents();
  }

  abstract getTarget(): Observable | Subscriber;
}

export class SubscriberEvent extends Event {
  constructor(
    readonly subscriber: Subscriber,
    declaration: Declaration,
    task: Task,
    sourceEvent?: Event,
    destinationEvents: Event[] = []
  ) {
    super(declaration, task, sourceEvent, destinationEvents);
  }

  getTarget() {
    return this.subscriber;
  }
}

export class ObservableEvent extends Event {
  constructor(
    readonly observable: Observable,
    declaration: Declaration,
    task: Task,
    sourceEvent?: Event,
    destinationEvents: Event[] = []
  ) {
    super(declaration, task, sourceEvent, destinationEvents);
  }

  getTarget() {
    return this.observable;
  }
}

export class Task {
  private static IDS = 0;

  readonly id = Task.IDS++;

  constructor(readonly name: string) {}
}

export type Ref<T> = T extends Declaration
  ? DeclarationRef
  : T extends Observable
  ? ObservableRef
  : T extends Subscriber
  ? SubscriberRef
  : T extends ObservableEvent
  ? ObservableEventRef
  : T extends SubscriberEvent
  ? SubscriberEventRef
  : T extends undefined
  ? undefined
  : never;

export function ref<
  T extends
    | Declaration
    | Observable
    | Subscriber
    | ObservableEvent
    | SubscriberEvent
    | undefined
>(target: T): Ref<T> {
  return target as any;
}

export type Deref<T> = T extends DeclarationRef
  ? Declaration
  : T extends ObservableRef
  ? Observable
  : T extends SubscriberRef
  ? Subscriber
  : T extends ObservableEventRef
  ? ObservableEvent
  : T extends SubscriberEventRef
  ? SubscriberEvent
  : T extends undefined
  ? undefined
  : never;

export function deref<
  T extends
    | DeclarationRef
    | ObservableRef
    | SubscriberRef
    | ObservableEventRef
    | SubscriberEventRef
    | undefined
>(target: T): Deref<T> {
  return target as any;
}
