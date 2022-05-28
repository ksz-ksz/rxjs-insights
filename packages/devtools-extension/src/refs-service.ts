import { GetterRef, PropertyRef, Ref, Refs } from '@app/protocols/refs';

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
          refId: this.nextRefId++,
        };
      case 'object':
        if (target === null) {
          return {
            type: 'null',
            refId: this.nextRefId++,
          };
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
          refId: this.nextRefId++,
          value: target,
        };
      case 'number':
        return {
          type: 'number',
          refId: this.nextRefId++,
          value: target,
        };
      case 'string':
        return {
          type: 'string',
          refId: this.nextRefId++,
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
          refId: this.nextRefId++,
          value: target,
        };
    }
  }

  expand = (
    refId: number
  ):
    | {
        props: PropertyRef[];
        proto: Ref;
      }
    | {
        setEntries: Ref[];
        props: PropertyRef[];
        proto: Ref;
      }
    | {
        mapEntries: [Ref, Ref][];
        props: PropertyRef[];
        proto: Ref;
      } => {
    console.log('expand', refId);
    const target = this.refs[refId].target;
    if (target instanceof Set) {
      return this.expandSet(target, refId);
    }
    if (target instanceof Map) {
      return this.expandMap(target, refId);
    }
    return this.expandObject(target, refId);
  };

  private createGetter(
    target: unknown,
    getter: () => unknown,
    parentRefId: number
  ): GetterRef {
    return {
      type: 'getter',
      refId: this.put(
        {
          target,
          getter,
        } as Getter,
        parentRefId
      ),
    };
  }

  private expandObject(
    target: unknown,
    refId: number
  ): {
    props: PropertyRef[];
    proto: Ref;
  } {
    const props = this.getProps(target, refId);
    const proto = this.getProto(target, refId);

    return {
      props,
      proto,
    };
  }

  private expandSet(
    target: Set<unknown>,
    refId: number
  ): {
    setEntries: Ref[];
    props: PropertyRef[];
    proto: Ref;
  } {
    const props = this.getProps(target, refId);
    const proto = this.getProto(target, refId);
    const setEntries = Array.from(target.values()).map((val) =>
      this.create(val, refId)
    );

    return {
      props,
      proto,
      setEntries,
    };
  }

  private expandMap(
    target: Map<unknown, unknown>,
    refId: number
  ): {
    mapEntries: [Ref, Ref][];
    props: PropertyRef[];
    proto: Ref;
  } {
    const props = this.getProps(target, refId);
    const proto = this.getProto(target, refId);
    const mapEntries = Array.from(target.entries()).map(
      ([key, val]): [Ref, Ref] => [
        this.create(key, refId),
        this.create(val, refId),
      ]
    );

    return {
      props,
      proto,
      mapEntries,
    };
  }

  invokeGetter(refId: number): {
    value: Ref;
  } {
    const { target, getter } = this.refs[refId].target as Getter;
    return {
      value: this.create(getter.call(target), refId),
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
            val: this.create(value, parentRefId),
            enumerable: true,
          });
        } else {
          nonenumerableProps.push({
            key,
            val: this.create(value, parentRefId),
            enumerable: false,
          });
        }
      } else {
        const { get, set, enumerable } = propDescriptor;
        if (get !== undefined) {
          if (enumerable) {
            enumerableProps.push({
              key,
              val: this.createGetter(object, get, parentRefId),
              enumerable: true,
            });
          } else {
            nonenumerableProps.push({
              key,
              val: this.createGetter(object, get, parentRefId),
              enumerable: false,
            });
          }
          accessors.push({
            key: `get ${key}`,
            val: this.create(get, parentRefId),
            enumerable: false,
          });
        }
        if (set !== undefined) {
          accessors.push({
            key: `set ${key}`,
            val: this.create(set, parentRefId),
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
              val: this.createGetter(object, get, parentRefId),
              enumerable: true,
            });
          } else {
            nonenumerableProps.push({
              key,
              val: this.createGetter(object, get, parentRefId),
              enumerable: false,
            });
          }
        }
      }
      proto = Object.getPrototypeOf(proto);
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
