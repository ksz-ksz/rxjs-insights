import { SubscriberRef, TargetRef } from './recorder';
import { InstrumentationContext } from './env';
import { setMeta } from './meta';
import { Constructor, ObserverLike, SubscriberLike } from './types';

export interface InstrumentedSubscriberConstructor {
  new (
    context: InstrumentationContext,
    subscriptionRef: SubscriberRef,
    destinationRef: TargetRef | undefined,
    destination: ObserverLike
  ): SubscriberLike;
}

export function createInstrumentedSubscriberConstructor(
  Subscriber: Constructor<SubscriberLike>
): InstrumentedSubscriberConstructor {
  return class InstrumentedSubscriber extends Subscriber {
    constructor(
      private readonly context: InstrumentationContext,
      private readonly subscriberRef: SubscriberRef,
      private readonly destinationRef: TargetRef | undefined,
      destination: ObserverLike
    ) {
      super(destination);
      setMeta<SubscriberLike>(this, {
        subscriberRef: this.subscriberRef,
      });
    }

    next(data: any) {
      if (this.closed) {
        return super.next(data);
      }
      const eventDeclarationRef = this.context.recorder.declarationRef(
        'next',
        super.next,
        [data]
      );
      const sourceEventRef = this.context.tracer.getTrace()?.eventRef;
      const eventRef = this.context.recorder.subscriberEventRef(
        eventDeclarationRef,
        this.subscriberRef,
        sourceEventRef
      );
      return this.context.tracer.run(
        { eventRef, targetRef: this.destinationRef },
        () => super.next(data)
      );
    }

    error(data: any) {
      if (this.closed) {
        return super.error(data);
      }
      const eventDeclarationRef = this.context.recorder.declarationRef(
        'error',
        super.error,
        [data]
      );
      const sourceEventRef = this.context.tracer.getTrace()?.eventRef;
      const eventRef = this.context.recorder.subscriberEventRef(
        eventDeclarationRef,
        this.subscriberRef,
        sourceEventRef
      );
      return this.context.tracer.run(
        { eventRef, targetRef: this.destinationRef },
        () => super.error(data)
      );
    }

    complete() {
      if (this.closed) {
        return super.complete();
      }
      const eventDeclarationRef = this.context.recorder.declarationRef(
        'complete',
        super.complete,
        []
      );
      const sourceEventRef = this.context.tracer.getTrace()?.eventRef;
      const eventRef = this.context.recorder.subscriberEventRef(
        eventDeclarationRef,
        this.subscriberRef,
        sourceEventRef
      );
      return this.context.tracer.run(
        { eventRef, targetRef: this.destinationRef },
        () => super.complete()
      );
    }

    unsubscribe() {
      if (this.closed) {
        return super.unsubscribe();
      }
      const eventDeclarationRef = this.context.recorder.declarationRef(
        'unsubscribe',
        super.unsubscribe,
        []
      );
      const sourceEventRef = this.context.tracer.getTrace()?.eventRef;
      const eventRef = this.context.recorder.subscriberEventRef(
        eventDeclarationRef,
        this.subscriberRef,
        sourceEventRef
      );
      return this.context.tracer.run(
        { eventRef, targetRef: this.destinationRef },
        () => super.unsubscribe()
      );
    }
  };
}
