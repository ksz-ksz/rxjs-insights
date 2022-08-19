import { ConnectableObservable } from '@rxjs-insights/rxjs-module';

type ObjectCreate = (
  object: object | null,
  props?: PropertyDescriptorMap & ThisType<any>
) => any;

function patchProps(props: PropertyDescriptorMap & ThisType<any>) {
  for (const propKey in props) {
    const propVal = props[propKey];
    if (propVal.value === ConnectableObservable.prototype.connect) {
      propVal.writable = true;
      propVal.configurable = true;
    }
  }
  return props;
}

function createInstrumentedObjectCreate(create: ObjectCreate) {
  return function instrumentedCreate(
    object: object | null,
    props?: PropertyDescriptorMap & ThisType<any>
  ): any {
    return props
      ? create.call(Object, object, patchProps(props))
      : create.call(Object, object);
  };
}

export function patchObjectCreate() {
  Object.create = createInstrumentedObjectCreate(Object.create);
}
