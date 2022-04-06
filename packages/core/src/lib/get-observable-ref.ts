import { InstrumentationContext } from './env';
import { ObservableLike } from './types';
import { getMeta, hasMeta, ObservableMeta, setMeta } from './meta';

function getOrRecordObservableMeta(
  context: InstrumentationContext,
  observable: ObservableLike
) {
  if (hasMeta(observable)) {
    return getMeta(observable);
  } else {
    const name: string =
      Object.getPrototypeOf(observable)?.constructor?.name ?? 'Observable';
    const declarationRef = context.recorder.declarationRef(
      `Internal${name}`,
      undefined,
      undefined,
      undefined,
      true
    );
    const observableRef = context.recorder.observableRef(
      observable,
      declarationRef
    );
    const meta: ObservableMeta = {
      observableRef,
    };
    return setMeta(observable, meta);
  }
}

export function getObservableRef(
  context: InstrumentationContext,
  observable: ObservableLike
) {
  const meta = getOrRecordObservableMeta(context, observable);
  return meta.observableRef;
}
