import { InstrumentationContext } from './env';
import { ObservableLike } from './types';
import { instrumentObservable } from './instrument-observable';

export function createInstrumentCreator(context: InstrumentationContext) {
  return function instrumentCreator<
    T extends (...args: any[]) => ObservableLike
  >(target: T, name = target.name): T {
    return function instrumentedCreator(...args) {
      const observable = target(...args);
      const declarationRef = context.recorder.declarationRef(
        name,
        target,
        args,
        context.locator.locate(1)
      );
      return instrumentObservable(context, observable, declarationRef);
    } as T;
  };
}
