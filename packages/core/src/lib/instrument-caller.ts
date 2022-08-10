import { InstrumentationContext } from './env';
import { ObservableLike } from './types';
import { EventRef } from './recorder';

export function createInstrumentCaller(context: InstrumentationContext) {
  return function instrumentCaller<
    T extends (...args: any[]) => ObservableLike
  >(target: T, name = target.name): T {
    return function instrumentedCaller(this: any, ...args) {
      const declarationRef = context.recorder.declarationRef(
        name,
        target,
        args,
        context.locator.locate(1)
      );
      const callerRef = context.recorder.callerRef(declarationRef);

      return context.tracer.run(
        {
          eventRef: context.tracer.getTrace()?.eventRef as EventRef,
          targetRef: callerRef,
        },
        () => target.call(this, ...args)
      );
    } as T;
  };
}
