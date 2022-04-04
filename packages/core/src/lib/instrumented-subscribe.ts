import { InstrumentationContext } from './env';
import { getObservableRef } from './get-observable-ref';
import { ObservableLike, ObserverLike, Subscribe } from './types';
import { InstrumentedSubscriberConstructor } from './instrumented-subscriber';

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

function getDestinationObservableRef(
  context: InstrumentationContext,
  args: any[]
) {
  const [maybeObserver] = args;
  if (maybeObserver instanceof context.Subject) {
    return getObservableRef(context, maybeObserver);
  } else {
    return context.tracer.getTrace()?.observableRef;
  }
}

export function createInstrumentedSubscribe(
  context: InstrumentationContext,
  subscribe: Subscribe,
  Subscriber: InstrumentedSubscriberConstructor
) {
  return function instrumentedSubscribe(this: ObservableLike, ...args: any[]) {
    const observable = this;
    const observableRef = getObservableRef(context, observable);
    const destinationObservableRef = getDestinationObservableRef(context, args);
    const subscriberRef = context.recorder.subscriberRef(
      args,
      observableRef,
      destinationObservableRef
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
    const subscriber = new Subscriber(
      context,
      subscriberRef,
      destinationObservableRef,
      observer
    );

    return context.tracer.run(
      { eventRef: subscribeEventRef, observableRef },
      () => subscribe.call(observable, subscriber)
    );
  };
}
