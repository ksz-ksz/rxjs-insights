import { GetterRef, PropertyRef, Ref, Refs } from '@app/protocols/refs';

class Getter {
  constructor(readonly target: unknown, readonly getter: () => unknown) {}
}

class SetEntries {
  constructor(readonly set: Set<unknown>) {}
}

class MapEntries {
  constructor(readonly map: Map<unknown, unknown>) {}
}

class MapEntry {
  constructor(readonly key: unknown, readonly val: unknown) {}
}

function getName(target: unknown): string {
  switch (typeof target) {
    case 'object':
      if (target === null) {
        return 'null';
      } else if (Array.isArray(target)) {
        return target.constructor?.name ?? 'Array';
      } else {
        return target.constructor?.name ?? 'Object';
      }
    case 'function':
      return target.name ? target.name : 'anonymous';
    case 'string':
      return `"${target}"`;
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'symbol':
    case 'bigint':
      return String(target);
  }
}

function getMapEntryName(key: unknown, val: unknown) {
  return `{ ${getName(key)} => ${getName(val)}`;
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

  expand = (refId: number): PropertyRef[] => {
    const target = this.refs[refId].target;
    if (target instanceof Set) {
      return this.expandSet(target, refId);
    }
    if (target instanceof SetEntries) {
      return this.expandSetEntries(target, refId);
    }
    if (target instanceof Map) {
      return this.expandMap(target, refId);
    }
    if (target instanceof MapEntries) {
      return this.expandMapEntries(target, refId);
    }
    if (target instanceof MapEntry) {
      return this.expandMapEntry(target, refId);
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
      refId: this.put(new Getter(target, getter), parentRefId),
    };
  }

  private getSetEntries(set: Set<unknown>, parentRefId: number): PropertyRef {
    return {
      key: 'Entries',
      val: {
        type: 'entries',
        refId: this.put(new SetEntries(set), parentRefId),
      },
      type: 'special',
    };
  }

  private getMapEntries(
    map: Map<unknown, unknown>,
    parentRefId: number
  ): PropertyRef {
    return {
      key: 'Entries',
      val: {
        type: 'entries',
        refId: this.put(new MapEntries(map), parentRefId),
      },
      type: 'special',
    };
  }

  private expandObject(target: unknown, refId: number): PropertyRef[] {
    const props = this.getProps(target, refId);
    const proto = this.getProto(target, refId);

    return [...props, proto];
  }

  private expandSet(target: Set<unknown>, refId: number): PropertyRef[] {
    const entries = this.getSetEntries(target, refId);
    const props = this.getProps(target, refId);
    const proto = this.getProto(target, refId);

    return [entries, ...props, proto];
  }

  private expandSetEntries(target: SetEntries, refId: number): PropertyRef[] {
    return Array.from(target.set.values()).map((val, index) => ({
      key: index,
      val: this.create(val, refId),
      type: 'enumerable',
    }));
  }

  private expandMap(
    target: Map<unknown, unknown>,
    refId: number
  ): PropertyRef[] {
    const entries = this.getMapEntries(target, refId);
    const props = this.getProps(target, refId);
    const proto = this.getProto(target, refId);

    return [entries, ...props, proto];
  }

  private expandMapEntries(target: MapEntries, refId: number): PropertyRef[] {
    return Array.from(target.map.entries()).map(([key, val], index) => ({
      key: index,
      val: {
        type: 'map-entry',
        refId: this.put(new MapEntry(key, val), refId),
        name: getMapEntryName(key, val),
      },
      type: 'enumerable',
    }));
  }

  private expandMapEntry(target: MapEntry, refId: number): PropertyRef[] {
    return [
      {
        key: 'key',
        val: this.create(target.key, refId),
        type: 'enumerable',
      },
      {
        key: 'val',
        val: this.create(target.val, refId),
        type: 'enumerable',
      },
    ];
  }

  invokeGetter(refId: number): Ref {
    const { target, getter } = this.refs[refId].target as Getter;
    return this.create(getter.call(target), refId);
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
            type: 'enumerable',
          });
        } else {
          nonenumerableProps.push({
            key,
            val: this.create(value, parentRefId),
            type: 'nonenumerable',
          });
        }
      } else {
        const { get, set, enumerable } = propDescriptor;
        if (get !== undefined) {
          if (enumerable) {
            enumerableProps.push({
              key,
              val: this.createGetter(object, get, parentRefId),
              type: 'enumerable',
            });
          } else {
            nonenumerableProps.push({
              key,
              val: this.createGetter(object, get, parentRefId),
              type: 'nonenumerable',
            });
          }
          accessors.push({
            key: `get ${key}`,
            val: this.create(get, parentRefId),
            type: 'nonenumerable',
          });
        }
        if (set !== undefined) {
          accessors.push({
            key: `set ${key}`,
            val: this.create(set, parentRefId),
            type: 'nonenumerable',
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
              type: 'enumerable',
            });
          } else {
            nonenumerableProps.push({
              key,
              val: this.createGetter(object, get, parentRefId),
              type: 'nonenumerable',
            });
          }
        }
      }
      proto = Object.getPrototypeOf(proto);
    }

    return [...enumerableProps, ...nonenumerableProps, ...accessors];
  }

  private getProto(object: unknown, parentRefId: number): PropertyRef {
    return {
      key: 'Prototype',
      val: this.create(Object.getPrototypeOf(object), parentRefId),
      type: 'special',
    };
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
