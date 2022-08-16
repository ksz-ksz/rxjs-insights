import { InstrumentationContext } from './env';
import { ConnectableObservableLike, ObservableLike } from './types';
import { DeclarationRef, EventRef, ObservableRef } from './recorder';
import { setMeta } from './meta';

let connectableObservablesWarningPrinted = false;

function printConnectableObservablesWarning() {
  if (!connectableObservablesWarningPrinted) {
    connectableObservablesWarningPrinted = true;
    console.warn(
      `RxJS Insights: could not instrument the 'connect' method. The data about the connectable observable might be incomplete.`
    );
  }
}

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
    try {
      instrumentConnect(
        observable as unknown as ConnectableObservableLike,
        context
      );
    } catch (e) {
      printConnectableObservablesWarning();
    }
  }

  return observable;
}
