import { getMeta, HasMeta, ObservableMeta } from '@rxjs-insights/core';
import { deref, Observable } from '@rxjs-insights/recorder';

export function getObservable(target: HasMeta<ObservableMeta>): Observable {
  return deref(getMeta(target).observableRef);
}
