import { InstrumentationContext } from './env';
import { DeclarationRef } from './recorder';
import { getObservableRef } from './get-observable-ref';
import { ObservableLike } from './types';
import { instrumentObservable } from './instrument-observable';

function instrumentOperatorFunction(
  context: InstrumentationContext,
  declarationRef: DeclarationRef,
  operatorFunction: (source: ObservableLike) => ObservableLike
): (source: ObservableLike) => ObservableLike {
  return function instrumentedOperatorFunction(source) {
    const observable = operatorFunction(source);
    const sourceObservableRef = getObservableRef(context, source);
    return instrumentObservable(
      context,
      observable,
      declarationRef,
      sourceObservableRef
    );
  };
}

export function createInstrumentOperator(context: InstrumentationContext) {
  return function instrumentOperator<
    T extends (...args: any[]) => (source: any) => ObservableLike
  >(target: T, name = target.name): T {
    return function instrumentedOperator(...args) {
      const declarationRef = context.recorder.declarationRef(
        name,
        target,
        args,
        context.locator.locate(1)
      );
      return instrumentOperatorFunction(
        context,
        declarationRef,
        target(...args)
      );
    } as T;
  };
}
