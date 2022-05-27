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
  target: unknown;
  getter: () => unknown;
}

export class RefsService implements Refs {
  private nextRefId = 0;
  private readonly refs: Record<
    number,
    { target: unknown; children: number[] }
  > = {};

  create(target: unknown, parentRefId?: number): Ref {
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
            refId: this.put(target, parentRefId),
          };
        } else {
          // todo: check observable and subscriber
          return {
            type: 'object',
            name: target?.constructor?.name ?? 'Object',
            refId: this.put(target, parentRefId),
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
          refId: this.put(target, parentRefId),
        };
      case 'symbol':
        return {
          type: 'symbol',
          name: target.toString(),
          refId: this.put(target, parentRefId),
        };
      case 'bigint':
        return {
          type: 'bigint',
          value: target,
        };
    }
  }

  private createGetter(
    target: unknown,
    getter: () => unknown,
    parentRefId: number
  ): GetterRef {
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
    const target = this.refs[ref.refId].target;

    const props = this.getProps(target, ref.refId);
    const proto = this.getProto(target, ref.refId);

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
    const target = this.refs[ref.refId].target as Set<unknown>;

    const props = this.getProps(target, ref.refId);
    const proto = this.getProto(target, ref.refId);
    const entries = Array.from(target.values()).map((val) =>
      this.create(val, ref.refId)
    );

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
    const target = this.refs[ref.refId].target as Map<unknown, unknown>;

    const props = this.getProps(target, ref.refId);
    const proto = this.getProto(target, ref.refId);
    const entries = Array.from(target.entries()).map(
      ([key, val]): [Ref, Ref] => [
        this.create(key, ref.refId),
        this.create(val, ref.refId),
      ]
    );

    return {
      props,
      proto,
      entries,
    };
  }

  invokeGetter(ref: GetterRef): {
    value: Ref;
  } {
    const { target, getter } = this.refs[ref.refId].target as Getter;
    return {
      value: this.create(getter.call(target), ref.refId),
    };
  }

  private getProps(object: unknown, parentRefId: number): PropertyRef[] {
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
            value: this.create(value, parentRefId),
            enumerable: true,
          });
        } else {
          nonenumerableProps.push({
            key,
            value: this.create(value, parentRefId),
            enumerable: false,
          });
        }
      } else {
        const { get, set, enumerable } = propDescriptor;
        if (get !== undefined) {
          if (enumerable) {
            enumerableProps.push({
              key,
              value: this.createGetter(object, get, parentRefId),
              enumerable: true,
            });
          } else {
            nonenumerableProps.push({
              key,
              value: this.createGetter(object, get, parentRefId),
              enumerable: false,
            });
          }
          accessors.push({
            key: `get ${key}`,
            value: this.create(get, parentRefId),
            enumerable: false,
          });
        }
        if (set !== undefined) {
          accessors.push({
            key: `set ${key}`,
            value: this.create(set, parentRefId),
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
              value: this.createGetter(object, get, parentRefId),
              enumerable: true,
            });
          } else {
            nonenumerableProps.push({
              key,
              value: this.createGetter(object, get, parentRefId),
              enumerable: false,
            });
          }
        }
      }
      proto = Object.getPrototypeOf(object);
    }

    return [...enumerableProps, ...nonenumerableProps, ...accessors];
  }

  private getProto(object: unknown, parentRefId: number) {
    return this.create(Object.getPrototypeOf(object), parentRefId);
  }

  private put(target: unknown, parentRefId?: number) {
    const refId = this.nextRefId++;
    this.refs[refId] = {
      target,
      children: [],
    };
    if (parentRefId !== undefined) {
      this.refs[parentRefId].children.push(refId);
    }
    return refId;
  }
}
