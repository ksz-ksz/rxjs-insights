import {
  DeclarationRef,
  EventRef,
  Locations,
  ObservableEventRef,
  ObservableLike,
  ObservableRef,
  Recorder,
  SubscriberEventRef,
  SubscriberRef,
} from '@rxjs-insights/core';
import {
  Declaration,
  deref,
  Observable,
  ObservableEvent,
  ref,
  Subscriber,
  SubscriberEvent,
  Task,
} from './model';
import { queueCleanup } from './queue-cleanup';

export class ModelRecorder implements Recorder {
  private currentTask: Task | undefined;

  declarationRef(
    name: string,
    func: Function,
    args: any[],
    locations?: Promise<Locations>
  ): DeclarationRef {
    const declaration = new Declaration(name, func, args);
    locations?.then((locations) => {
      declaration.locations = locations;
    });

    return ref(declaration);
  }

  observableRef(
    target: ObservableLike,
    observableDeclarationRef: DeclarationRef,
    sourceObservableRef?: ObservableRef
  ): ObservableRef {
    const declaration = deref(observableDeclarationRef);
    const sourceObservable = deref(sourceObservableRef);
    const observable = new Observable(target, declaration, sourceObservable);

    return ref(observable);
  }

  subscriberRef(
    target: any[],
    observableRef: ObservableRef,
    destinationObservableRef: ObservableRef | undefined
  ): SubscriberRef {
    const observable = deref(observableRef);
    const destinationObservable = deref(destinationObservableRef);
    const subscriber = new Subscriber(
      target,
      observable,
      destinationObservable
    );

    observable.subscribers.push(subscriber);

    return ref(subscriber);
  }

  observableEventRef(
    eventDeclarationRef: DeclarationRef,
    observableRef: ObservableRef,
    sourceEventRef: EventRef | undefined
  ): ObservableEventRef {
    const declaration = deref(eventDeclarationRef);
    const observable = deref(observableRef);
    const sourceEvent = deref(sourceEventRef);
    const currentTask = this.getCurrentTask();
    const event = new ObservableEvent(
      observable,
      declaration,
      currentTask,
      sourceEvent
    );

    observable.events.push(event);
    sourceEvent?.succeedingEvents?.push(event);

    return ref(event);
  }

  subscriberEventRef(
    eventDeclarationRef: DeclarationRef,
    subscriberRef: SubscriberRef,
    sourceEventRef: EventRef | undefined
  ): SubscriberEventRef {
    const declaration = deref(eventDeclarationRef);
    const subscriber = deref(subscriberRef);
    const sourceEvent = deref(sourceEventRef);
    const currentTask = this.getCurrentTask();
    const event = new SubscriberEvent(
      subscriber,
      declaration,
      currentTask,
      sourceEvent
    );

    subscriber.events.push(event);
    sourceEvent?.succeedingEvents?.push(event);

    return ref(event);
  }

  addTag(observableRef: ObservableRef, tag: string) {
    const observable = deref(observableRef);
    observable.tags.push(tag);
  }

  startTask(name: string) {
    this.currentTask = new Task(name);
  }

  endTask() {
    this.currentTask = undefined;
  }

  private getCurrentTask() {
    if (this.currentTask === undefined) {
      this.currentTask = new Task('main');
      queueCleanup(() => {
        this.currentTask = undefined;
      });
    }

    return this.currentTask;
  }
}
