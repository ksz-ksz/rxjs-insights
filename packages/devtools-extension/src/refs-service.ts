import {
  ArrayRef,
  FunctionRef,
  GetterRef,
  MapRef,
  ObjectRef,
  ObservableRef,
  PropertyRef,
  Ref,
  Refs,
  SetRef,
  SubscriberRef,
} from '@app/protocols/refs';

interface Getter {
  target: any;
  getter: () => any;
}

export class RefsService implements Refs {
  private nextRefId = 0;
  private readonly refs: Record<number, any> = {};

  create(target: any): Ref {
    switch (typeof target) {
      case 'undefined':
        return {
          type: 'undefined',
        };
      case 'object':
        if (target === null) {
          return { type: 'null' };
        } else if (Array.isArray(target)) {
          return {
            type: 'array',
            name: target?.constructor?.name ?? 'Array',
            length: target.length,
            refId: this.put(target),
          };
        } else {
          // todo: check observable and subscriber
          return {
            type: 'object',
            name: target?.constructor?.name ?? 'Object',
            refId: this.put(target),
          };
        }
      case 'boolean':
        return {
          type: 'boolean',
          value: target,
        };
      case 'number':
        return {
          type: 'number',
          value: target,
        };
      case 'string':
        return {
          type: 'string',
          value: target,
        };
      case 'function':
        return {
          type: 'function',
          name: target.name ? target.name : 'anonymous',
          refId: this.put(target),
        };
      case 'symbol':
        return {
          type: 'symbol',
          name: target.toString(),
          refId: this.put(target),
        };
      case 'bigint':
        return {
          type: 'bigint',
          value: target,
        };
    }
  }

  createGetter(target: any, getter: () => any): GetterRef {
    return {
      type: 'getter',
      refId: this.put({
        target,
        getter,
      } as Getter),
    };
  }

  expand(
    ref: ObjectRef | ArrayRef | FunctionRef | ObservableRef | SubscriberRef
  ): {
    props: PropertyRef[];
    proto: Ref;
  } {
    const object = this.refs[ref.refId];

    const props = this.getProps(object);
    const proto = this.getProto(object);

    return {
      props,
      proto,
    };
  }

  expandSet(ref: SetRef): {
    entries: Ref[];
    props: PropertyRef[];
    proto: Ref;
  } {
    const target = this.refs[ref.refId] as Set<any>;

    const props = this.getProps(target);
    const proto = this.getProto(target);
    const entries = Array.from(target.values()).map((val) => this.create(val));

    return {
      props,
      proto,
      entries,
    };
  }

  expandMap(ref: MapRef): {
    entries: [Ref, Ref][];
    props: PropertyRef[];
    proto: Ref;
  } {
    const target = this.refs[ref.refId] as Map<any, any>;

    const props = this.getProps(target);
    const proto = this.getProto(target);
    const entries = Array.from(target.entries()).map(
      ([key, val]): [Ref, Ref] => [this.create(key), this.create(val)]
    );

    return {
      props,
      proto,
      entries,
    };
  }

  expandGetter(ref: GetterRef): {
    value: Ref;
  } {
    return undefined as any;
  }

  private getProps(object: any): PropertyRef[] {
    const enumerableProps: PropertyRef[] = [];
    const nonenumerableProps: PropertyRef[] = [];
    const accessors: PropertyRef[] = [];

    for (const [key, propDescriptor] of Object.entries(
      Object.getOwnPropertyDescriptors(object)
    )) {
      if (propDescriptor.hasOwnProperty('value')) {
        const { value, enumerable } = propDescriptor;
        if (enumerable) {
          enumerableProps.push({
            key,
            value: this.create(value),
            enumerable: true,
          });
        } else {
          nonenumerableProps.push({
            key,
            value: this.create(value),
            enumerable: false,
          });
        }
      } else {
        const { get, set, enumerable } = propDescriptor;
        if (get !== undefined) {
          if (enumerable) {
            enumerableProps.push({
              key,
              value: this.createGetter(object, get),
              enumerable: true,
            });
          } else {
            nonenumerableProps.push({
              key,
              value: this.createGetter(object, get),
              enumerable: false,
            });
          }
          accessors.push({
            key: `get ${key}`,
            value: this.create(get),
            enumerable: false,
          });
        }
        if (set !== undefined) {
          accessors.push({
            key: `set ${key}`,
            value: this.create(set),
            enumerable: false,
          });
        }
      }
    }

    let proto = Object.getPrototypeOf(object);
    while (proto !== null) {
      for (const [key, propDescriptor] of Object.entries(
        Object.getOwnPropertyDescriptors(proto)
      )) {
        const { get, enumerable } = propDescriptor;
        if (get !== undefined) {
          if (enumerable) {
            enumerableProps.push({
              key,
              value: this.createGetter(object, get),
              enumerable: true,
            });
          } else {
            nonenumerableProps.push({
              key,
              value: this.createGetter(object, get),
              enumerable: false,
            });
          }
        }
      }
      proto = Object.getPrototypeOf(object);
    }

    return [...enumerableProps, ...nonenumerableProps, ...accessors];
  }

  private getProto(object: any) {
    return this.create(Object.getPrototypeOf(object));
  }

  private put(target: any) {
    const refId = this.nextRefId++;
    this.refs[refId] = target;
    return refId;
  }
}
