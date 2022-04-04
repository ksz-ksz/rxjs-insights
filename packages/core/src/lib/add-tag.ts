import { InstrumentationContext } from './env';
import { ObservableLike } from './types';
import { getObservableRef } from './get-observable-ref';

export function createAddTag(context: InstrumentationContext) {
  return function addTag(observable: ObservableLike, tag: string) {
    const observableRef = getObservableRef(context, observable);
    context.recorder.addTag(observableRef, tag);
  };
}
