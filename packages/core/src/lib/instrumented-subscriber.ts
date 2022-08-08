import { EventRef, SubscriberRef, TargetRef } from './recorder';
import { InstrumentationContext } from './env';
import { setMeta } from './meta';
import { SubscriberLike } from './types';

const CONTEXT = Symbol.for('@rxjs-insights/subscriber');

interface StackItem {
  subscriberRef: SubscriberRef;
  destinationRef: TargetRef | undefined;
}

interface SubscriberContext {
  context: InstrumentationContext;
  stack: StackItem[];
  next: (value: any) => void;
  error: (err: any) => void;
  complete: () => void;
  unsubscribe: () => void;
}

function setContext(subscriber: SubscriberLike, context: SubscriberContext) {
  // @ts-ignore
  subscriber[CONTEXT] = context;
}

function getContext(subscriber: SubscriberLike): SubscriberContext {
  // @ts-ignore
  return subscriber[CONTEXT];
}

function reduceStack(
  context: InstrumentationContext,
  stack: StackItem[],
  name: string,
  func: Function,
  args?: any[]
) {
  let eventRef: EventRef | undefined = context.tracer.getTrace()?.eventRef;
  let targetRef: TargetRef | undefined;

  for (const { subscriberRef, destinationRef } of stack) {
    const eventDeclarationRef = context.recorder.declarationRef(
      name,
      func,
      args
    );
    const sourceEventRef = eventRef;
    eventRef = context.recorder.subscriberEventRef(
      eventDeclarationRef,
      subscriberRef,
      sourceEventRef
    );
    targetRef = destinationRef;
  }

  return { eventRef, targetRef } as {
    eventRef: EventRef;
    targetRef: TargetRef | undefined;
  };
}

function reduceStackBackward(
  context: InstrumentationContext,
  stack: StackItem[],
  name: string,
  func: Function,
  args?: any[]
) {
  let eventRef: EventRef | undefined = context.tracer.getTrace()?.eventRef;
  let targetRef: TargetRef | undefined;

  for (let i = stack.length - 1; i >= 0; i--) {
    const { subscriberRef, destinationRef } = stack[i];
    const eventDeclarationRef = context.recorder.declarationRef(
      name,
      func,
      args
    );
    const sourceEventRef = eventRef;
    eventRef = context.recorder.subscriberEventRef(
      eventDeclarationRef,
      subscriberRef,
      sourceEventRef
    );
    targetRef = destinationRef;
  }

  return { eventRef, targetRef } as {
    eventRef: EventRef;
    targetRef: TargetRef | undefined;
  };
}

function instrumentedNext(this: SubscriberLike, data: any) {
  const { context, stack, next } = getContext(this);

  if (this.closed) {
    return next.call(this, data);
  }

  return context.tracer.run(
    reduceStack(context, stack, 'next', next, [data]),
    () => next.call(this, data)
  );
}

function instrumentedError(this: SubscriberLike, data: any) {
  const { context, stack, error } = getContext(this);

  if (this.closed) {
    return error.call(this, data);
  }

  return context.tracer.run(
    reduceStack(context, stack, 'error', error, [data]),
    () => error.call(this, data)
  );
}

function instrumentedComplete(this: SubscriberLike) {
  const { context, stack, complete } = getContext(this);

  if (this.closed) {
    return complete.call(this);
  }
  return context.tracer.run(
    reduceStack(context, stack, 'complete', complete),
    () => complete.call(this)
  );
}

function instrumentedUnsubscribe(this: SubscriberLike) {
  const { context, stack, unsubscribe } = getContext(this);

  if (this.closed) {
    return unsubscribe.call(this);
  }
  return context.tracer.run(
    reduceStackBackward(context, stack, 'unsubscribe', unsubscribe),
    () => unsubscribe.call(this)
  );
}

export function instrumentSubscriber(
  context: InstrumentationContext,
  subscriberRef: SubscriberRef,
  destinationRef: TargetRef | undefined,
  subscriber: SubscriberLike
) {
  const subscriberContext = getContext(subscriber);
  if (subscriberContext === undefined) {
    const { next, error, complete, unsubscribe } = subscriber;
    setContext(subscriber, {
      context,
      next,
      error,
      complete,
      unsubscribe,
      stack: [
        {
          subscriberRef,
          destinationRef,
        },
      ],
    });
    setMeta(subscriber, {
      subscriberRef,
    });
    subscriber.next = instrumentedNext;
    subscriber.error = instrumentedError;
    subscriber.complete = instrumentedComplete;
    subscriber.unsubscribe = instrumentedUnsubscribe;
  } else {
    subscriberContext.stack.unshift({
      subscriberRef,
      destinationRef,
    });
  }
}
