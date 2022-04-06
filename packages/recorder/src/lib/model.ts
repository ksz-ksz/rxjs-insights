import {
  DeclarationRef,
  Locations,
  ObservableEventRef,
  ObservableLike,
  ObservableRef,
  SubscriberEventRef,
  SubscriberRef,
} from '@rxjs-insights/core';

export class Declaration {
  private static IDS = 0;

  readonly id = Declaration.IDS++;

  constructor(
    readonly name: string,
    readonly internal: boolean,
    readonly func?: Function,
    readonly args?: any[],
    public locations: Locations = {}
  ) {}
}

export class Observable {
  private static IDS = 0;

  readonly id = Observable.IDS++;

  constructor(
    readonly target: ObservableLike,
    readonly declaration: Declaration,
    readonly sourceObservable?: Observable,
    readonly subscribers: Subscriber[] = [],
    readonly events: ObservableEvent[] = [],
    readonly tags: string[] = []
  ) {}
}

export class Subscriber {
  private static IDS = 0;

  readonly id = Subscriber.IDS++;

  constructor(
    readonly target: any[],
    readonly observable: Observable,
    readonly destinationObservable: Observable | undefined,
    readonly events: SubscriberEvent[] = []
  ) {}

  get declaration() {
    return this.observable.declaration;
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

  abstract readonly target: Subscriber | Observable;
}

export class SubscriberEvent extends Event {
  constructor(
    readonly target: Subscriber,
    declaration: Declaration,
    task: Task,
    precedingEvent?: Event,
    succeedingEvents: Event[] = []
  ) {
    super(declaration, task, precedingEvent, succeedingEvents);
  }
}

export class ObservableEvent extends Event {
  constructor(
    readonly target: Observable,
    declaration: Declaration,
    task: Task,
    precedingEvent?: Event,
    succeedingEvents: Event[] = []
  ) {
    super(declaration, task, precedingEvent, succeedingEvents);
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
