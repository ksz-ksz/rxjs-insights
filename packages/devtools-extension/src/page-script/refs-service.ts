import {
  ArrayRef,
  CallerRef,
  EntriesRef,
  EventRef,
  FunctionRef,
  GetterRef,
  LocationRef,
  MapEntryRef,
  MapRef,
  ObjectRef,
  ObservableRef,
  PropertyRef,
  Ref,
  Refs,
  SetRef,
  SubscriberRef,
} from '@app/protocols/refs';
import { Event, Observable, Subscriber, Target } from '@rxjs-insights/recorder';
import {
  getObservable,
  getPrecedingEvent,
  getSubscriber,
  getSucceedingEvents,
  isObservableTarget,
  isSubscriberTarget,
} from '@rxjs-insights/recorder-utils';
import { formatTimestamp } from '@app/utils/format-timestamp';
import { Location, Locations } from '@rxjs-insights//core';
import { Caller } from '@rxjs-insights/recorder/src/lib/model';

function getPropertyDescriptors(
  target: any
): [string | symbol, PropertyDescriptor][] {
  return Reflect.ownKeys(target).map((key) => [
    key,
    Reflect.getOwnPropertyDescriptor(target, key)!,
  ]);
}

function isObservable(x: any): x is Observable {
  return 'target' in x && 'type' in x && x.type === 'observable';
}

function isSubscriber(x: any): x is Subscriber {
  return 'target' in x && 'type' in x && x.type === 'subscriber';
}

function isCaller(x: any): x is Caller {
  return 'declaration' in x && 'type' in x && x.type === 'caller';
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

class ObjectsRegistry {
  private nextObjectId = 0;
  private readonly objects = new Map<number, WeakRef<object>>();
  private readonly ids = new WeakMap<object, number>();

  getObjectId(object: object) {
    let objectId = this.ids.get(object);
    if (objectId === undefined) {
      objectId = this.nextObjectId++;
      this.objects.set(objectId, new WeakRef(object));
      this.ids.set(object, objectId);
    }
    return objectId;
  }

  getObject<T = object>(id: number): T | undefined {
    return this.objects.get(id)?.deref() as T | undefined;
  }
}

class TargetsRegistry {
  private readonly targets = new Map<number, WeakRef<Target>>();

  addTarget(target: Target) {
    if (!this.targets.has(target.id)) {
      this.targets.set(target.id, new WeakRef<Target>(target));
    }
  }

  getTarget<T = object>(id: number): T | undefined {
    return this.targets.get(id)?.deref() as T | undefined;
  }
}

class SymbolsRegistry {
  private nextSymbolId = 0;
  private readonly symbols = new Map<number, symbol>();
  private readonly ids = new Map<symbol, number>();

  getSymbolId(symbol: symbol) {
    let symbolId = this.ids.get(symbol);
    if (symbolId === undefined) {
      symbolId = this.nextSymbolId++;
      this.symbols.set(symbolId, symbol);
      this.ids.set(symbol, symbolId);
    }
    return symbolId;
  }

  getSymbol(id: number): symbol | undefined {
    return this.symbols.get(id);
  }
}

class KeysRegistry {
  private nextKeyId = 0;
  private readonly keys = new Map<string, string | number | symbol>();
  private readonly ids = new Map<string | number | symbol, string>();

  getKeyId(key: string | number | symbol) {
    let keyId = this.ids.get(key);
    if (keyId === undefined) {
      keyId = String(this.nextKeyId++);
      this.keys.set(keyId, key);
      this.ids.set(key, keyId);
    }
    return keyId;
  }

  getKey(id: string) {
    return this.keys.get(id);
  }
}

class StrongRefsRegistry {
  private nextStrongRefId = 0;
  private readonly registry = new Map<number, unknown>();
  private readonly finalizationRegistry = new FinalizationRegistry<number>(
    (id: number) => {
      this.registry.delete(id);
    }
  );

  add(target: object, ref: unknown) {
    const id = this.nextStrongRefId++;
    this.registry.set(id, ref);
    this.finalizationRegistry.register(target, id);
  }
}

export class RefsService implements Refs {
  private readonly objects = new ObjectsRegistry();
  private readonly symbols = new SymbolsRegistry();
  private readonly targets = new TargetsRegistry();
  private readonly keys = new KeysRegistry();
  private readonly strongRefs = new StrongRefsRegistry();
  private nextShallowObjectId = 0;

  getObject(objectId: number): unknown | undefined {
    return this.objects.getObject(objectId);
  }

  getSymbol(symbolId: number): symbol | undefined {
    return this.symbols.getSymbol(symbolId);
  }

  getTarget(targetId: number): Target | undefined {
    return this.targets.getTarget(targetId);
  }

  create(target: unknown): Ref {
    if (typeof target === 'object' && target !== null) {
      if (isObservableTarget(target)) {
        const observable = getObservable(target);
        this.targets.addTarget(observable);
        return {
          type: 'observable',
          id: observable.id,
          name: observable.declaration.name,
          tags: observable.tags,
          objectId: this.objects.getObjectId(observable),
          locations: observable.declaration.locations,
        };
      } else if (isObservable(target)) {
        this.targets.addTarget(target);
        return {
          type: 'observable',
          id: target.id,
          name: target.declaration.name,
          tags: target.tags,
          objectId: this.objects.getObjectId(target),
          locations: target.declaration.locations,
        };
      } else if (isSubscriberTarget(target)) {
        const subscriber = getSubscriber(target);
        this.targets.addTarget(subscriber);
        return {
          type: 'subscriber',
          id: subscriber.id,
          name: subscriber.declaration.name,
          tags: subscriber.tags,
          objectId: this.objects.getObjectId(subscriber),
          locations: subscriber.declaration.locations,
        };
      } else if (isSubscriber(target)) {
        this.targets.addTarget(target);
        return {
          type: 'subscriber',
          id: target.id,
          name: target.declaration.name,
          tags: target.tags,
          objectId: this.objects.getObjectId(target),
          locations: target.declaration.locations,
        };
      } else if (isCaller(target)) {
        this.targets.addTarget(target);
        return {
          type: 'caller',
          id: target.id,
          name: target.declaration.name,
          tags: target.tags,
          objectId: this.objects.getObjectId(target),
          locations: target.declaration.locations,
        };
      } else if (isEvent(target)) {
        return {
          type: 'event',
          time: target.time,
          name: target.declaration.name,
          data:
            target.type === 'next' || target.type === 'error'
              ? this.create(target.declaration.args?.[0])
              : undefined,
          eventType: target.type,
          objectId: this.objects.getObjectId(target),
        };
      }
    }
    return this.createDefault(target);
  }

  private createDefault(target: unknown): Ref {
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
            objectId: this.objects.getObjectId(target),
          };
        } else if (target instanceof Set) {
          return {
            type: 'set',
            name: target?.constructor?.name ?? 'Set',
            size: target.size,
            objectId: this.objects.getObjectId(target),
          };
        } else if (target instanceof Map) {
          return {
            type: 'map',
            name: target?.constructor?.name ?? 'Map',
            size: target.size,
            objectId: this.objects.getObjectId(target),
          };
        } else {
          return {
            type: 'object',
            name: target?.constructor?.name ?? 'Object',
            objectId: this.objects.getObjectId(target),
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
          objectId: this.objects.getObjectId(target),
        };
      case 'symbol':
        return {
          type: 'symbol',
          name: target.toString(),
          symbolId: this.symbols.getSymbolId(target),
        };
      case 'bigint':
        return {
          type: 'bigint',
          value: target.toString(),
        };
    }
  }

  private createEntries(target: object, key: string, size: number): EntriesRef {
    return {
      type: 'entries',
      objectId: this.nextShallowObjectId++,
      targetObjectId: this.objects.getObjectId(target),
      key,
      size,
    };
  }

  expand = (ref: Ref): PropertyRef[] => {
    switch (ref.type) {
      case 'object':
      case 'array':
      case 'function':
        return this.expandObject(ref);
      case 'set':
        return this.expandSet(ref);
      case 'map':
        return this.expandMap(ref);
      case 'map-entry':
        return this.expandMapEntry(ref);
      case 'entries':
        return this.expandEntries(ref);
      case 'observable':
        return this.expandObservable(ref);
      case 'subscriber':
        return this.expandSubscriber(ref);
      case 'caller':
        return this.expandCaller(ref);
      case 'event':
        return this.expandEvent(ref);
      case 'location':
        return this.expandLocations(ref);
      default:
        return [];
    }
  };

  private createGetter(target: object, getter: () => unknown): GetterRef {
    return {
      type: 'getter',
      targetObjectId: this.objects.getObjectId(target),
      getterObjectId: this.objects.getObjectId(getter),
    };
  }

  private property(key: string, val: Ref): PropertyRef {
    return {
      type: 'enumerable',
      key: key,
      keyId: this.keys.getKeyId(key),
      val: val,
    };
  }

  private expandObservable(ref: ObservableRef): PropertyRef[] {
    const observable = this.objects.getObject<Observable>(ref.objectId);
    if (!observable) {
      return [];
    }
    const {
      target,
      declaration,
      sourceObservable,
      subscribers,
      sources,
      events,
      tags,
      id,
    } = observable;

    return [
      this.property('Id', this.create(id)),
      this.property('Name', this.create(declaration.name)),
      this.property(
        'Tags',
        this.createEntries(observable, 'tags', tags.length)
      ),
      ...(observable.internal
        ? [this.property('Internal', this.create(observable.internal))]
        : []),
      ...(declaration.func
        ? [this.property('Function', this.create(declaration.func))]
        : []),
      ...(declaration.args
        ? [
            this.property(
              'Arguments',
              this.createEntries(declaration, 'args', declaration.args.length)
            ),
          ]
        : []),
      ...(declaration.locations?.generatedLocation !== undefined ||
      declaration.locations?.originalLocation !== undefined
        ? [
            this.property(
              'Location',
              this.createLocations(declaration.locations)
            ),
          ]
        : []),
      ...(sourceObservable
        ? [this.property('SourceObservable', this.create(sourceObservable))]
        : []),
      this.property(
        'Subscribers',
        this.createEntries(observable, 'subscribers', subscribers.length)
      ),
      this.property(
        'Sources',
        this.createEntries(observable, 'sources', sources.length)
      ),
      this.property(
        'Events',
        this.createEntries(observable, 'events', events.length)
      ),
      this.property('Target', this.createDefault(target)),
    ];
  }

  private expandSubscriber(ref: SubscriberRef): PropertyRef[] {
    const subscriber = this.objects.getObject<Subscriber>(ref.objectId);
    if (!subscriber) {
      return [];
    }
    const {
      id,
      observable,
      sources,
      destination,
      declaration,
      tags,
      target,
      events,
    } = subscriber;
    return [
      this.property('Id', this.create(id)),
      this.property('Name', this.create(declaration.name)),
      this.property(
        'Tags',
        this.createEntries(subscriber, 'tags', tags.length)
      ),
      ...(subscriber.internal
        ? [this.property('Internal', this.create(subscriber.internal))]
        : []),
      ...(declaration.func
        ? [this.property('Function', this.create(declaration.func))]
        : []),
      ...(declaration.args
        ? [
            this.property(
              'Arguments',
              this.createEntries(declaration, 'args', declaration.args.length)
            ),
          ]
        : []),
      ...(declaration.locations?.generatedLocation !== undefined ||
      declaration.locations.originalLocation !== undefined
        ? [
            this.property(
              'Location',
              this.createLocations(declaration.locations)
            ),
          ]
        : []),
      this.property('Observable', this.create(observable)),
      ...(destination
        ? [this.property('Destination', this.create(destination))]
        : []),
      this.property(
        'Sources',
        this.createEntries(subscriber, 'sources', sources.length)
      ),
      this.property(
        'Events',
        this.createEntries(subscriber, 'events', events.length)
      ),
      ...(target.length !== 0
        ? [
            this.property(
              'Target',
              target.length === 1
                ? this.createDefault(target[0])
                : this.createEntries(target, 'target', target.length)
            ),
          ]
        : []),
    ];
  }

  private expandCaller(ref: CallerRef): PropertyRef[] {
    const caller = this.objects.getObject<Caller>(ref.objectId);
    if (!caller) {
      return [];
    }
    const { id, sources, declaration } = caller;
    return [
      this.property('Id', this.create(id)),
      this.property('Name', this.create(declaration.name)),
      ...(declaration.func
        ? [this.property('Function', this.create(declaration.func))]
        : []),
      ...(declaration.args
        ? [
            this.property(
              'Arguments',
              this.createEntries(declaration, 'args', declaration.args.length)
            ),
          ]
        : []),
      ...(declaration.locations?.generatedLocation !== undefined ||
      declaration.locations.originalLocation !== undefined
        ? [
            this.property(
              'Location',
              this.createLocations(declaration.locations)
            ),
          ]
        : []),
      this.property(
        'Sources',
        this.createEntries(caller, 'sources', sources.length)
      ),
    ];
  }

  private expandEvent(ref: EventRef): PropertyRef[] {
    const event = this.objects.getObject<Event>(ref.objectId);
    if (!event) {
      return [];
    }
    const { time, declaration, type, target, timestamp, task } = event;
    const precedingEvent = getPrecedingEvent(event);
    const succeedingEvents = getSucceedingEvents(event);
    return [
      this.property('Time', this.create(time)),
      // this.property('Name', this.create(declaration.name)),
      this.property('Type', this.create(type)),
      this.property('Task', {
        type: 'text',
        text: task.name,
        suffix: `#${task.id}`,
      }),
      this.property('Timestamp', {
        type: 'text',
        text: formatTimestamp(timestamp),
      }),
      ...(type === 'next'
        ? [this.property('Value', this.create(declaration.args?.[0]))]
        : []),
      ...(type === 'error'
        ? [this.property('Error', this.create(declaration.args?.[0]))]
        : []),
      ...((type === 'subscribe' && declaration.args?.length) ?? 0 !== 0
        ? [
            this.property(
              'Subscriber',
              declaration.args?.length === 1
                ? this.create(declaration.args?.[0])
                : this.create(declaration.args)
            ),
          ]
        : []),
      ...(declaration.locations?.generatedLocation !== undefined ||
      declaration.locations.originalLocation !== undefined
        ? [
            this.property(
              'Location',
              this.createLocations(declaration.locations)
            ),
          ]
        : []),
      this.property('Target', this.create(target)),
      this.property('PrecedingEvent', this.create(precedingEvent)),
      this.property(
        'SucceedingEvents',
        this.createEntries(event, 'succeedingEvents', succeedingEvents.length)
      ),
    ];
  }
  private expandLocations(ref: LocationRef): PropertyRef[] {
    const locations = this.objects.getObject<Locations>(ref.objectId ?? -1);

    if (locations) {
      const { originalLocation, generatedLocation } = locations;
      return [
        ...(originalLocation
          ? [
              this.property(
                'SourceLocation',
                this.createLocation(originalLocation)
              ),
            ]
          : []),
        ...(generatedLocation
          ? [
              this.property(
                'BundleLocation',
                this.createLocation(generatedLocation)
              ),
            ]
          : []),
      ];
    } else {
      return [];
    }
  }

  private expandObject(ref: ObjectRef | ArrayRef | FunctionRef): PropertyRef[] {
    const target = this.objects.getObject(ref.objectId);

    if (target) {
      const props = this.getProps(target);
      const proto = this.getProto(target);

      return [...props, proto];
    } else {
      return [];
    }
  }

  private getSetEntries(set: Set<unknown>): PropertyRef {
    return {
      keyId: this.keys.getKeyId('[[Entries]]'),
      key: '[[Entries]]',
      val: {
        type: 'entries',
        size: set.size,
        key: 'entries',
        objectId: this.nextShallowObjectId++,
        targetObjectId: this.objects.getObjectId(set),
      },
      type: 'special',
    };
  }

  private getMapEntries(map: Map<unknown, unknown>): PropertyRef {
    return {
      key: '[[Entries]]',
      keyId: this.keys.getKeyId('[[Entries]]'),
      val: {
        type: 'entries',
        size: map.size,
        key: 'entries',
        objectId: this.nextShallowObjectId++,
        targetObjectId: this.objects.getObjectId(map),
      },
      type: 'special',
    };
  }

  private expandSet(ref: SetRef): PropertyRef[] {
    const set = this.objects.getObject(ref.objectId) as Set<unknown>;
    if (set) {
      const entries = this.getSetEntries(set);
      const props = this.getProps(set);
      const proto = this.getProto(set);

      return [entries, ...props, proto];
    } else {
      return [];
    }
  }

  private expandMap(ref: MapRef): PropertyRef[] {
    const map = this.objects.getObject(ref.objectId) as Map<unknown, unknown>;
    if (map) {
      const entries = this.getMapEntries(map);
      const props = this.getProps(map);
      const proto = this.getProto(map);

      return [entries, ...props, proto];
    } else {
      return [];
    }
  }

  private expandMapEntry(ref: MapEntryRef): PropertyRef[] {
    return [this.property('key', ref.key), this.property('val', ref.val)];
  }

  private expandEntries(ref: EntriesRef): PropertyRef[] {
    const target = this.objects.getObject(ref.targetObjectId);
    if (target) {
      if (target instanceof Set) {
        return this.expandSetEntries(target);
      } else if (target instanceof Map) {
        return this.expandMapEntries(target);
      } else {
        return this.expandEntriesByKey(target, ref.key);
      }
    } else {
      return [];
    }
  }

  private entries(entries: Array<unknown>): PropertyRef[] {
    return entries.map((val, index) => ({
      key: String(index),
      keyId: this.keys.getKeyId(String(index)),
      val: this.create(val),
      type: 'enumerable',
    }));
  }

  private expandSetEntries(target: Set<unknown>): PropertyRef[] {
    return this.entries(Array.from(target.values()));
  }

  private expandMapEntries(target: Map<unknown, unknown>): PropertyRef[] {
    return Array.from(target.entries()).map(([key, val], index) => ({
      key: String(index),
      keyId: this.keys.getKeyId(String(index)),
      val: {
        type: 'map-entry',
        key: this.create(key),
        val: this.create(val),
        objectId: this.nextShallowObjectId++,
      },
      type: 'enumerable',
    }));
  }

  private expandEntriesByKey(target: any, key: string) {
    const entries = target[key];
    if (Array.isArray(entries)) {
      return this.entries(entries);
    } else {
      return [];
    }
  }

  invokeGetter(ref: GetterRef): Ref {
    const target = this.objects.getObject<object>(ref.targetObjectId);
    const getter = this.objects.getObject<() => unknown>(ref.getterObjectId);
    if (target && getter) {
      try {
        const result = getter.call(target);
        this.strongRefs.add(target, result);
        return this.create(result);
      } catch (e) {
        this.strongRefs.add(target, e);
        return this.create(e);
      }
    } else {
      return this.create(null);
    }
  }

  private getProps(object: object): PropertyRef[] {
    const keys = new Set<string | symbol>(['__proto__']);
    const enumerableProps: PropertyRef[] = [];
    const nonenumerableProps: PropertyRef[] = [];
    const accessors: PropertyRef[] = [];

    for (const [key, propDescriptor] of getPropertyDescriptors(object)) {
      keys.add(key);
      if (propDescriptor.hasOwnProperty('value')) {
        const { value, enumerable } = propDescriptor;
        if (enumerable) {
          enumerableProps.push({
            key: String(key),
            keyId: this.keys.getKeyId(key),
            val: this.create(value),
            type: 'enumerable',
          });
        } else {
          nonenumerableProps.push({
            key: String(key),
            keyId: this.keys.getKeyId(key),
            val: this.create(value),
            type: 'nonenumerable',
          });
        }
      } else {
        const { get, set, enumerable } = propDescriptor;
        if (get !== undefined) {
          if (enumerable) {
            enumerableProps.push({
              key: String(key),
              keyId: this.keys.getKeyId(key),
              val: this.createGetter(object, get),
              type: 'enumerable',
            });
          } else {
            nonenumerableProps.push({
              key: String(key),
              keyId: this.keys.getKeyId(key),
              val: this.createGetter(object, get),
              type: 'nonenumerable',
            });
          }
          accessors.push({
            key: `get ${String(key)}`,
            keyId: this.keys.getKeyId(`get ${String(key)}`),
            val: this.create(get),
            type: 'nonenumerable',
          });
        }
        if (set !== undefined) {
          accessors.push({
            key: `set ${String(key)}`,
            keyId: this.keys.getKeyId(`set ${String(key)}`),
            val: this.create(set),
            type: 'nonenumerable',
          });
        }
      }
    }

    let proto = Object.getPrototypeOf(object);
    while (proto !== null) {
      for (const [key, propDescriptor] of getPropertyDescriptors(proto)) {
        if (!keys.has(key)) {
          keys.add(key);
          const { get, enumerable } = propDescriptor;
          if (get !== undefined) {
            if (enumerable) {
              enumerableProps.push({
                key: String(key),
                keyId: this.keys.getKeyId(key),
                val: this.createGetter(object, get),
                type: 'enumerable',
              });
            } else {
              nonenumerableProps.push({
                key: String(key),
                keyId: this.keys.getKeyId(key),
                val: this.createGetter(object, get),
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

  private getProto(object: object): PropertyRef {
    return {
      key: '[[Prototype]]',
      keyId: this.keys.getKeyId('[[Prototype]]'),
      val: this.create(Object.getPrototypeOf(object)),
      type: 'special',
    };
  }

  private createLocations(locations: Locations): LocationRef {
    const location = (
      locations.originalLocation
        ? locations.originalLocation
        : locations.generatedLocation
    )!;
    return {
      type: 'location',
      file: location.file,
      line: location.line,
      column: location.column,
      objectId: this.objects.getObjectId(locations),
    };
  }

  private createLocation(location: Location): LocationRef {
    return {
      type: 'location',
      file: location.file,
      line: location.line,
      column: location.column,
    };
  }
}
