import {
  CallerRef,
  DeclarationRef,
  EventRef,
  Locations,
  ObservableEventRef,
  ObservableLike,
  ObservableRef,
  PromiseOrValue,
  Recorder,
  SubscriberEventRef,
  SubscriberRef,
  TargetRef,
} from '@rxjs-insights/core';
import {
  Caller,
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

function isPromise<T>(x: PromiseOrValue<T>): x is Promise<T> {
  return 'then' in x && 'catch' in x;
}

export class ModelRecorder implements Recorder {
  private currentTask: Task | undefined;

  declarationRef(
    name: string,
    func?: Function,
    args?: any[],
    locations: PromiseOrValue<Locations> = {},
    internal = false
  ): DeclarationRef {
    const declaration = new Declaration(name, internal, func, args);
    if (isPromise(locations)) {
      locations?.then((locations) => {
        declaration.locations = locations;
      });
    } else {
      declaration.locations = locations;
    }

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
    destinationTargetRef: TargetRef | undefined
  ): SubscriberRef {
    const observable = deref(observableRef);
    const destination = deref(destinationTargetRef);
    const subscriber = new Subscriber(target, observable, destination);

    destination?.sources?.push(subscriber);
    observable.subscribers.push(subscriber);

    return ref(subscriber);
  }

  callerRef(callerDeclarationRef: DeclarationRef): CallerRef {
    const declaration = deref(callerDeclarationRef);
    const caller = new Caller(declaration);

    return ref(caller);
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
