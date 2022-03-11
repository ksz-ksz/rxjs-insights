import { InstrumentationContext } from './env';
import { Constructor, ObservableLike } from './types';
import { instrumentObservable } from './instrument-observable';

function getPrototypeChainLength(superClass: object, subClass: object) {
  let length = 0;
  let currentClass: object | null = subClass;
  while (true) {
    if (superClass === currentClass) {
      return length;
    } else {
      currentClass = Reflect.getPrototypeOf(currentClass!);
      if (currentClass === undefined) {
        return 0;
      } else {
        length++;
      }
    }
  }
}

export function createInstrumentConstructor(context: InstrumentationContext) {
  return function instrumentConstructor<T extends Constructor<ObservableLike>>(
    name: string,
    target: T
  ): T {
    const proxy = new Proxy(target, {
      construct(target: T, args: any[], newTarget: Function) {
        const targetName = target === newTarget ? name : newTarget.name;
        const prototypeChainLength = getPrototypeChainLength(proxy, newTarget);
        const observable = Reflect.construct(target, args, newTarget);
        const declarationRef = context.recorder.declarationRef(
          targetName,
          target,
          args,
          context.locator.locate(prototypeChainLength + 1)
        );
        return instrumentObservable(context, observable, declarationRef);
      },
    });
    return proxy;
  };
}
