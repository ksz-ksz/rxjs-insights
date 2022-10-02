import { InstrumentationContext } from './env';
import { getObservableRef } from './get-observable-ref';
import {
  Constructor,
  ObservableLike,
  ObserverLike,
  SubjectLike,
  Subscribe,
  SubscriberLike,
} from './types';
import { instrumentSubscriber } from './instrumented-subscriber';

function noop() {}

function isObserver(x: any): x is ObserverLike {
  return (
    typeof x?.next === 'function' &&
    typeof x?.error === 'function' &&
    typeof x?.complete === 'function'
  );
}

function isPartialObserver(x: any): x is Partial<ObserverLike> {
  return (
    typeof x?.next === 'function' ||
    typeof x?.error === 'function' ||
    typeof x?.complete === 'function'
  );
}

function getObserver(
  observerOrNext?: any,
  error?: any,
  complete?: any
): ObserverLike {
  if (isObserver(observerOrNext)) {
    return observerOrNext;
  } else if (isPartialObserver(observerOrNext)) {
    return {
      next: observerOrNext.next ?? noop,
      error: observerOrNext.error ?? noop,
      complete: observerOrNext.complete ?? noop,
    };
  } else {
    return {
      next: observerOrNext ?? noop,
      error: error ?? noop,
      complete: complete ?? noop,
    };
  }
}

function getDestinationTargetRef(
  context: InstrumentationContext,
  Subject: Constructor<SubjectLike>,
  subscribe: Subscribe,
  args: any[]
) {
  const [maybeObserver] = args;
  if (maybeObserver instanceof Subject) {
    return getObservableRef(context, maybeObserver);
  } else {
    const targetRef = context.tracer.getTrace()?.targetRef;
    if (targetRef) {
      return targetRef;
    } else {
      const callerDeclarationRef = context.recorder.declarationRef(
        'subscribe',
        subscribe,
        args,
        context.locator.locate(2)
      );
      return context.recorder.callerRef(callerDeclarationRef);
    }
  }
}

export function createInstrumentedSubscribe(
  context: InstrumentationContext,
  subscribe: Subscribe,
  Subscriber: Constructor<SubscriberLike>,
  Subject: Constructor<SubjectLike>
) {
  return function instrumentedSubscribe(this: ObservableLike, ...args: any[]) {
    const observable = this;
    const observableRef = getObservableRef(context, observable);
    const destinationTargetRef = getDestinationTargetRef(
      context,
      Subject,
      subscribe,
      args
    );
    const subscriberRef = context.recorder.subscriberRef(
      args,
      observableRef,
      destinationTargetRef
    );
    const subscribeDeclarationRef = context.recorder.declarationRef(
      'subscribe',
      subscribe,
      args
    );
    const sourceEventRef = context.tracer.getTrace()?.eventRef;
    const subscribeEventRef = context.recorder.subscriberEventRef(
      subscribeDeclarationRef,
      subscriberRef,
      sourceEventRef
    );

    const observer = getObserver(...args);
    const subscriber =
      observer instanceof Subscriber ? observer : new Subscriber(observer);

    instrumentSubscriber(
      context,
      subscriberRef,
      destinationTargetRef,
      subscriber
    );

    return context.tracer.run(
      { eventRef: subscribeEventRef, targetRef: subscriberRef },
      () => subscribe.call(observable, subscriber)
    );
  };
}
