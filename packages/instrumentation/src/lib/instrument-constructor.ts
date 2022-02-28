import { InstrumentationContext } from './env';
import { Constructor, ObservableLike } from './types';
import { instrumentObservable } from './instrument-observable';

export function createInstrumentConstructor(context: InstrumentationContext) {
  return function instrumentConstructor<T extends Constructor<ObservableLike>>(
    name: string,
    target: T
  ): T {
    return new Proxy(target, {
      construct(target: T, args: any[], newTarget: Function) {
        const observable = Reflect.construct(target, args, newTarget);
        const declarationRef = context.recorder.declarationRef(
          name,
          target,
          args,
          context.locator.locate(1)
        );
        return instrumentObservable(context, observable, declarationRef);
      },
    });
  };
}
