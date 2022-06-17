import { GetterRef, PropertyRef, Ref, Refs } from '@app/protocols/refs';
import { Event, Observable, Subscriber } from '@rxjs-insights/recorder';
import {
  getObservable,
  getPrecedingEvent,
  getSubscriber,
  getSucceedingEvents,
  isObservableTarget,
  isSubscriberTarget,
} from '@rxjs-insights/recorder-utils';

class Getter {
  constructor(readonly target: unknown, readonly getter: () => unknown) {}
}

class Entries {
  constructor(readonly entries: unknown[]) {}
}

class MapEntry {
  constructor(readonly key: unknown, readonly val: unknown) {}
}

class Location {
  constructor(
    readonly file: string,
    readonly line: number,
    readonly column: number
  ) {}

  static from(location: Location | undefined) {
    return location !== undefined
      ? new Location(location.file, location.line, location.column)
      : undefined;
  }
}

class Locations {
  constructor(readonly generated?: Location, readonly original?: Location) {}
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

function isEvent(x: any): x is Event {
  return (
    'target' in x &&
    'type' in x &&
    (x.type === 'subscribe' ||
      x.type === 'unsubscribe' ||
      x.type === 'next' ||
      x.type === 'error' ||
      x.type === 'complete')
  );
}

function property(key: string, val: Ref): PropertyRef {
  return {
    type: 'enumerable',
    key: key,
    val: val,
  };
}

function getTimestamp(timestamp: number) {
  const t = new Date(timestamp);
  return `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}.${t.getMilliseconds()}`;
}

export class RefsService implements Refs {
  private nextRefId = 0;
  private readonly refs: Record<
    number,
    { target: unknown; children: number[] }
  > = {};

  create(target: unknown, parentRefId?: number, store = true): Ref {
    if (typeof target === 'object' && target !== null) {
      if (isObservableTarget(target)) {
        const observable = getObservable(target);
        return {
          type: 'observable',
          id: observable.id,
          name: observable.declaration.name,
          tags: observable.tags,
          refId: this.refId(observable, parentRefId, store),
        };
      } else if (isObservable(target)) {
        return {
          type: 'observable',
          id: target.id,
          name: target.declaration.name,
          tags: target.tags,
          refId: this.refId(target, parentRefId, store),
        };
      } else if (isSubscriberTarget(target)) {
        const subscriber = getSubscriber(target);
        return {
          type: 'subscriber',
          id: subscriber.id,
          name: subscriber.declaration.name,
          tags: subscriber.tags,
          refId: this.refId(subscriber, parentRefId, store),
        };
      } else if (isSubscriber(target)) {
        return {
          type: 'subscriber',
          id: target.id,
          name: target.declaration.name,
          tags: target.tags,
          refId: this.refId(target, parentRefId, store),
        };
      } else if (isEvent(target)) {
        return {
          type: 'event',
          time: target.time,
          name: target.declaration.name,
          data:
            target.type === 'next' || target.type === 'error'
              ? this.create(target.declaration.args?.[0], parentRefId, false)
              : undefined,
          eventType: target.type,
          refId: this.refId(target, parentRefId, store),
        };
      } else if (target instanceof Locations) {
        const location = target.original ?? target.generated;
        return {
          type: 'location',
          file: location?.file ?? 'unknown',
          line: location?.line ?? 0,
          column: location?.column ?? 0,
          refId: this.refId(target, parentRefId, store),
        };
      } else if (target instanceof Location) {
        return {
          type: 'location',
          file: target?.file ?? 'unknown',
          line: target?.line ?? 0,
          column: target?.column ?? 0,
        };
      }
    }
    return this.createDefault(target, parentRefId, store);
  }

  private createDefault(
    target: unknown,
    parentRefId: number | undefined,
    store = true
  ): Ref {
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
            refId: this.refId(target, parentRefId, store),
          };
        } else if (target instanceof Set) {
          return {
            type: 'set',
            name: target?.constructor?.name ?? 'Set',
            size: target.size,
            refId: this.refId(target, parentRefId, store),
          };
        } else if (target instanceof Map) {
          return {
            type: 'map',
            name: target?.constructor?.name ?? 'Map',
            size: target.size,
            refId: this.refId(target, parentRefId, store),
          };
        } else if (target instanceof MapEntry) {
          return {
            type: 'map-entry',
            key: this.create(target.key, parentRefId, false),
            val: this.create(target.val, parentRefId, false),
            refId: this.refId(target, parentRefId, store),
          };
        } else if (target instanceof Entries) {
          return {
            type: 'entries',
            size: target.entries.length,
            refId: this.refId(target, parentRefId, store),
          };
        } else {
          return {
            type: 'object',
            name: target?.constructor?.name ?? 'Object',
            refId: this.refId(target, parentRefId, store),
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
          refId: this.refId(target, parentRefId, store),
        };
      case 'symbol':
        return {
          type: 'symbol',
          name: target.toString(),
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
    if (isEvent(target)) {
      return this.expandEvent(target, refId);
    }
    if (target instanceof Locations) {
      return this.expandLocations(target, refId);
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
      refId: this.refId(new Getter(target, getter), parentRefId),
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
      property('Id', this.create(id, refId)),
      property('Name', this.create(declaration.name, refId)),
      property('Tags', this.create(new Entries(tags), refId)),
      ...(declaration.internal
        ? [property('Internal', this.create(declaration.internal, refId))]
        : []),
      ...(declaration.func
        ? [property('Function', this.create(declaration.func, refId))]
        : []),
      ...(declaration.args
        ? [
            property(
              'Arguments',
              this.create(new Entries(declaration.args), refId)
            ),
          ]
        : []),
      ...(declaration.locations?.generatedLocation !== undefined ||
      declaration.locations.originalLocation !== undefined
        ? [
            property(
              'Location',
              this.create(
                new Locations(
                  Location.from(declaration.locations.generatedLocation),
                  Location.from(declaration.locations.originalLocation)
                ),
                refId
              )
            ),
          ]
        : []),
      ...(sourceObservable
        ? [property('SourceObservable', this.create(sourceObservable, refId))]
        : []),
      property('Subscribers', this.create(new Entries(subscribers), refId)),
      property('Events', this.create(new Entries(events), refId)),
      property('Target', this.createDefault(target, refId)),
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
      property('Id', this.create(id, refId)),
      property('Name', this.create(declaration.name, refId)),
      property('Tags', this.create(new Entries(tags), refId)),
      ...(declaration.internal
        ? [property('Internal', this.create(declaration.internal, refId))]
        : []),
      ...(declaration.func
        ? [property('Function', this.create(declaration.func, refId))]
        : []),
      ...(declaration.args
        ? [
            property(
              'Arguments',
              this.create(new Entries(declaration.args), refId)
            ),
          ]
        : []),
      ...(declaration.locations?.generatedLocation !== undefined ||
      declaration.locations.originalLocation !== undefined
        ? [
            property(
              'Location',
              this.create(
                new Locations(
                  Location.from(declaration.locations.generatedLocation),
                  Location.from(declaration.locations.originalLocation)
                ),
                refId
              )
            ),
          ]
        : []),
      property('Observable', this.create(observable, refId)),
      ...(destinationObservable
        ? [
            property(
              'DestinationObservable',
              this.create(destinationObservable, refId)
            ),
          ]
        : []),
      property('Events', this.create(new Entries(events), refId)),
      ...(target.length !== 0
        ? [
            property(
              'Target',
              target.length === 1
                ? this.createDefault(target[0], refId)
                : this.create(new Entries(target), refId)
            ),
          ]
        : []),
    ];
  }

  private expandEvent(event: Event, refId: number): PropertyRef[] {
    const { time, declaration, type, target, timestamp, task } = event;
    const precedingEvent = getPrecedingEvent(event);
    const succeedingEvents = getSucceedingEvents(event);
    return [
      property('Time', this.create(time, refId)),
      property('Name', this.create(declaration.name, refId)),
      property('Type', this.create(type, refId)),
      property('Task', {
        type: 'text',
        text: task.name,
        suffix: `#${task.id}`,
      }),
      property('Timestamp', {
        type: 'text',
        text: getTimestamp(timestamp),
      }),
      ...(type === 'next'
        ? [property('Value', this.create(declaration.args?.[0], refId))]
        : []),
      ...(type === 'error'
        ? [property('Error', this.create(declaration.args?.[0], refId))]
        : []),
      ...((type === 'subscribe' && declaration.args?.length) ?? 0 !== 0
        ? [
            property(
              'Subscriber',
              declaration.args?.length === 1
                ? this.create(declaration.args?.[0], refId)
                : this.create(declaration.args)
            ),
          ]
        : []),
      ...(declaration.locations?.generatedLocation !== undefined ||
      declaration.locations.originalLocation !== undefined
        ? [
            property(
              'Location',
              this.create(
                new Locations(
                  Location.from(declaration.locations.generatedLocation),
                  Location.from(declaration.locations.originalLocation)
                ),
                refId
              )
            ),
          ]
        : []),
      property('Target', this.create(target, refId)),
      property('PrecedingEvent', this.create(precedingEvent, refId)),
      property(
        'SucceedingEvents',
        this.create(new Entries(succeedingEvents), refId)
      ),
    ];
  }
  private expandLocations(target: Locations, refId: number): PropertyRef[] {
    const { original, generated } = target;
    return [
      ...(original
        ? [property('SourceLocation', this.create(original, refId))]
        : []),
      ...(generated
        ? [property('BundleLocation', this.create(generated, refId))]
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
        refId: this.refId(new Entries(Array.from(set.values())), parentRefId),
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
        refId: this.refId(
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

  private refId(target: unknown, parentRefId: number | undefined): number;
  private refId(
    target: unknown,
    parentRefId: number | undefined,
    store: boolean
  ): number | undefined;
  private refId(
    target: unknown,
    parentRefId: number | undefined,
    store: boolean = true
  ): number | undefined {
    if (store) {
      const refId = this.nextRefId++;
      this.refs[refId] = {
        target,
        children: [],
      };
      if (parentRefId !== undefined) {
        this.refs[parentRefId].children.push(refId);
      }
      return refId;
    } else {
      return undefined;
    }
  }
}
