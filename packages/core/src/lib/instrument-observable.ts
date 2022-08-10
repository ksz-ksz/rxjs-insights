import { InstrumentationContext } from './env';
import { ConnectableObservableLike, ObservableLike } from './types';
import { DeclarationRef, EventRef, ObservableRef } from './recorder';
import { setMeta } from './meta';

function instrumentConnect(
  observable: ConnectableObservableLike,
  context: InstrumentationContext
) {
  const { connect } = observable;
  observable.connect = function instrumentedConnect(
    this: ConnectableObservableLike
  ) {
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

export function instrumentObservable<T extends ObservableLike>(
  context: InstrumentationContext,
  observable: T,
  declarationRef: DeclarationRef,
  sourceObservableRef?: ObservableRef
) {
  const observableRef = context.recorder.observableRef(
    observable,
    declarationRef,
    sourceObservableRef
  );
  setMeta<ObservableLike>(observable, {
    observableRef,
  });

  if ('connect' in observable) {
    instrumentConnect(
      observable as unknown as ConnectableObservableLike,
      context
    );
  }

  return observable;
}
