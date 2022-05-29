import { GetterRef, PropertyRef, Ref, Refs } from '@app/protocols/refs';
import {
  getObservable,
  getSubscriber,
  isObservableTarget,
  isSubscriberTarget,
} from '@app/common/target';
import { Observable, Subscriber } from '@rxjs-insights/recorder';

class Getter {
  constructor(readonly target: unknown, readonly getter: () => unknown) {}
}

class Entries {
  constructor(readonly entries: unknown[]) {}
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
        return `${target.constructor?.name ?? 'Array'}[]`;
      } else {
        return `${target.constructor?.name ?? 'Object'}{}`;
      }
    case 'function':
      return `f ${target.name ?? ''}()`;
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

function getPropertyDescriptors(target: any): [string, PropertyDescriptor][] {
  return Reflect.ownKeys(target).map((key) => [
    String(key),
    Reflect.getOwnPropertyDescriptor(target, key)!,
  ]);
}

function isObservable(x: any): x is Observable {
  return 'target' in x && 'type' in x && x.type === 'observable';
}

function isSubscriber(x: any): x is Subscriber {
  return 'target' in x && 'type' in x && x.type === 'subscriber';
}

function special(key: string, val: Ref): PropertyRef {
  return {
    type: 'special',
    key: key,
    val: val,
  };
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
          return {
            type: 'null',
          };
        } else if (Array.isArray(target)) {
          return {
            type: 'array',
            name: target?.constructor?.name ?? 'Array',
            length: target.length,
            refId: this.put(target, parentRefId),
          };
        } else if (target instanceof Set) {
          return {
            type: 'set',
            name: target?.constructor?.name ?? 'Set',
            size: target.size,
            refId: this.put(target, parentRefId),
          };
        } else if (target instanceof Map) {
          return {
            type: 'map',
            name: target?.constructor?.name ?? 'Map',
            size: target.size,
            refId: this.put(target, parentRefId),
          };
        } else if (target instanceof MapEntry) {
          return {
            type: 'map-entry',
            keyName: getName(target.key),
            valName: getName(target.val),
            refId: this.put(target, parentRefId),
          };
        } else if (target instanceof Entries) {
          return {
            type: 'entries',
            size: target.entries.length,
            refId: this.put(target, parentRefId),
          };
        } else if (isObservableTarget(target)) {
          const observable = getObservable(target);
          return {
            type: 'observable',
            id: observable.id,
            name: observable.declaration.name,
            tags: observable.tags,
            refId: this.put(observable, parentRefId),
          };
        } else if (isObservable(target)) {
          return {
            type: 'observable',
            id: target.id,
            name: target.declaration.name,
            tags: target.tags,
            refId: this.put(target, parentRefId),
          };
        } else if (isSubscriberTarget(target)) {
          const subscriber = getSubscriber(target);
          return {
            type: 'subscriber',
            id: subscriber.id,
            name: subscriber.declaration.name,
            tags: subscriber.tags,
            refId: this.put(subscriber, parentRefId),
          };
        } else if (isSubscriber(target)) {
          return {
            type: 'subscriber',
            id: target.id,
            name: target.declaration.name,
            tags: target.tags,
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
          name: target.name ?? 'anonymous',
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
          value: target.toString(),
        };
    }
  }

  expand = (refId: number): PropertyRef[] => {
    const target = this.refs[refId].target;
    if (target instanceof Set) {
      return this.expandSet(target, refId);
    }
    if (target instanceof Map) {
      return this.expandMap(target, refId);
    }
    if (target instanceof Entries) {
      return this.expandEntries(target, refId);
    }
    if (target instanceof MapEntry) {
      return this.expandMapEntry(target, refId);
    }
    if (isObservable(target)) {
      return this.expandObservable(target, refId);
    }
    if (isSubscriber(target)) {
      return this.expandSubscriber(target, refId);
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

  private expandObservable(
    observable: Observable,
    refId: number
  ): PropertyRef[] {
    const {
      target,
      declaration,
      sourceObservable,
      subscribers,
      events,
      tags,
      id,
    } = observable;

    return [
      special('Id', this.create(id, refId)),
      special('Name', this.create(declaration.name, refId)),
      special('Tags', this.create(new Entries(tags), refId)),
      special('Declaration', this.create(declaration, refId)),
      ...(sourceObservable
        ? [special('SourceObservable', this.create(sourceObservable, refId))]
        : []),
      special('Subscribers', this.create(new Entries(subscribers), refId)),
      special('Events', this.create(new Entries(events), refId)),
      special('Target', {
        type: 'object',
        name: getName(target),
        refId: this.put(target, refId),
      }),
    ];
  }

  private expandSubscriber(
    subscriber: Subscriber,
    refId: number
  ): PropertyRef[] {
    const {
      id,
      observable,
      destinationObservable,
      declaration,
      tags,
      target,
      events,
    } = subscriber;
    return [
      special('Id', this.create(id, refId)),
      special('Name', this.create(declaration.name, refId)),
      special('Tags', this.create(new Entries(tags), refId)),
      special('Declaration', this.create(declaration, refId)),
      special('Observable', this.create(observable, refId)),
      ...(destinationObservable
        ? [
            special(
              'DestinationObservable',
              this.create(destinationObservable, refId)
            ),
          ]
        : []),
      special('Events', this.create(new Entries(events), refId)),
      ...(target.length !== 0
        ? [
            special(
              'Target',
              target.length === 1
                ? {
                    type: typeof target[0] as any,
                    name: getName(target[0]),
                    refId: this.put(target[0], refId),
                  }
                : this.create(target, refId)
            ),
          ]
        : []),
    ];
  }

  private expandObject(target: unknown, refId: number): PropertyRef[] {
    const props = this.getProps(target, refId);
    const proto = this.getProto(target, refId);

    return [...props, proto];
  }

  private getSetEntries(set: Set<unknown>, parentRefId: number): PropertyRef {
    return {
      key: '[[Entries]]',
      val: {
        type: 'entries',
        size: set.size,
        refId: this.put(new Entries(Array.from(set.values())), parentRefId),
      },
      type: 'special',
    };
  }

  private getMapEntries(
    map: Map<unknown, unknown>,
    parentRefId: number
  ): PropertyRef {
    return {
      key: '[[Entries]]',
      val: {
        type: 'entries',
        size: map.size,
        refId: this.put(
          new Entries(
            Array.from(map.entries()).map(
              ([key, val]) => new MapEntry(key, val)
            )
          ),
          parentRefId
        ),
      },
      type: 'special',
    };
  }

  private expandSet(target: Set<unknown>, refId: number): PropertyRef[] {
    const entries = this.getSetEntries(target, refId);
    const props = this.getProps(target, refId);
    const proto = this.getProto(target, refId);

    return [entries, ...props, proto];
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

  private expandEntries(target: Entries, refId: number): PropertyRef[] {
    return target.entries.map((val, index) => ({
      key: String(index),
      val: this.create(val, refId),
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
    try {
      const result = getter.call(target);
      return this.create(result, refId);
    } catch (error) {
      return this.create(error, refId);
    }
  }

  private getProps(object: unknown, parentRefId: number): PropertyRef[] {
    const enumerableProps: PropertyRef[] = [];
    const nonenumerableProps: PropertyRef[] = [];
    const accessors: PropertyRef[] = [];

    for (const [key, propDescriptor] of getPropertyDescriptors(object)) {
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
      for (const [key, propDescriptor] of getPropertyDescriptors(proto)) {
        if (key !== '__proto__') {
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
      }
      proto = Object.getPrototypeOf(proto);
    }

    return [...enumerableProps, ...nonenumerableProps, ...accessors];
  }

  private getProto(object: unknown, parentRefId: number): PropertyRef {
    return {
      key: '[[Prototype]]',
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
