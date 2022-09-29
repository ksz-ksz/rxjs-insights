import {
  DeclarationRef,
  Locations,
  ObservableEventRef,
  ObservableLike,
  ObservableRef,
  SubscriberEventRef,
  SubscriberRef,
} from '@rxjs-insights/core';
import { CallerRef } from '@rxjs-insights/core';

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

export abstract class Target<EVENT extends Event = Event> {
  private static IDS = 0;

  readonly id = Target.IDS++;

  protected constructor(
    readonly sources: Subscriber[] = [],
    readonly events: EVENT[] = []
  ) {}

  abstract readonly type: 'observable' | 'subscriber' | 'caller';
  abstract readonly tags: string[];
  abstract readonly internal: boolean;
  abstract readonly declaration: Declaration;
  abstract readonly destinations: Target[];
}

export class Observable extends Target<ObservableEvent> {
  readonly type = 'observable';

  constructor(
    public internal: boolean,
    readonly target: ObservableLike,
    readonly declaration: Declaration,
    readonly sourceObservable?: Observable,
    readonly subscribers: Subscriber[] = [],
    sources: Subscriber[] = [],
    events: ObservableEvent[] = [],
    readonly tags: string[] = []
  ) {
    super(sources, events);
  }

  get destinations(): Target[] {
    return this.subscribers;
  }
}

export class Subscriber extends Target<SubscriberEvent> {
  readonly type = 'subscriber';

  constructor(
    readonly target: any[],
    readonly observable: Observable,
    readonly destination: Target | undefined,
    sources: Subscriber[] = [],
    events: SubscriberEvent[] = []
  ) {
    super(sources, events);
  }

  get destinations(): Target[] {
    return this.destination ? [this.destination] : [];
  }

  get declaration() {
    return this.observable.declaration;
  }

  get tags(): string[] {
    return this.observable.tags;
  }

  get internal(): boolean {
    return this.observable.internal;
  }
}

export class Caller extends Target {
  readonly type = 'caller';

  constructor(
    readonly declaration: Declaration,
    sources: Subscriber[] = [],
    events: ObservableEvent[] = []
  ) {
    super(sources, events);
  }

  get destinations(): Target[] {
    return [];
  }

  get tags(): string[] {
    return [];
  }

  get internal(): boolean {
    return false;
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

  get type(): 'subscribe' | 'unsubscribe' | 'next' | 'error' | 'complete' {
    return this.declaration.name as any;
  }
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
  : T extends Caller
  ? CallerRef
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
    | Caller
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
  : T extends CallerRef
  ? Caller
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
    | CallerRef
    | ObservableEventRef
    | SubscriberEventRef
    | undefined
>(target: T): Deref<T> {
  return target as any;
}
