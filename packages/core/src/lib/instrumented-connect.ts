import { InstrumentationContext } from './env';
import { Connect, ConnectableObservableLike } from './types';
import { EventRef } from './recorder';

export function createInstrumentedConnect(
  context: InstrumentationContext,
  connect: Connect
): Connect {
  return function instrumentedConnect(this: ConnectableObservableLike) {
    const declarationRef = context.recorder.declarationRef(
      'connect',
      connect,
      [],
      context.locator.locate(1)
    );
    const callerRef = context.recorder.callerRef(declarationRef);

    return context.tracer.run(
      {
        eventRef: context.tracer.getTrace()?.eventRef as EventRef,
        targetRef: callerRef,
      },
      () => connect.call(this)
    );
  };
}
