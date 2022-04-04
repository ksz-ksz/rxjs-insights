import { InstrumentationContext } from './env';
import { ObservableLike } from './types';
import { instrumentObservable } from './instrument-observable';

export function createInstrumentSingleton(context: InstrumentationContext) {
  return function instrumentSingleton<T extends ObservableLike>(
    name: string,
    observable: T
  ): T {
    const declarationRef = context.recorder.declarationRef(name);
    return instrumentObservable(context, observable, declarationRef);
  };
}
