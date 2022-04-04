import { InstrumentationContext } from './env';
import { ObservableLike } from './types';
import { DeclarationRef, ObservableRef } from './recorder';
import { setMeta } from './meta';

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

  return observable;
}
