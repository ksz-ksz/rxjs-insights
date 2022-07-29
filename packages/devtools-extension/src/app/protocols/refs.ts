import { Locations } from '@rxjs-insights/core';

export const RefsChannel = 'RefsChannel';

export interface PropertyRef {
  keyId: string;
  key: string;
  val: Ref;
  type: 'enumerable' | 'nonenumerable' | 'special';
}

export interface Refs {
  expand(ref: Ref): PropertyRef[];
  invokeGetter(ref: GetterRef): Ref;
}

export interface ObjectRef {
  type: 'object';
  name: string;
  objectId: number;
}

export interface ArrayRef {
  type: 'array';
  name: string;
  length: number;
  objectId: number;
}

export interface FunctionRef {
  type: 'function';
  name: string;
  objectId: number;
}

export interface SetRef {
  type: 'set';
  name: string;
  size: number;
  objectId: number;
}

export interface MapRef {
  type: 'map';
  name: string;
  size: number;
  objectId: number;
}

export interface MapEntryRef {
  type: 'map-entry';
  key: Ref;
  val: Ref;
  objectId: number;
}

export interface EntriesRef {
  type: 'entries';
  key: string;
  size: number;
  objectId: number;
  targetObjectId: number;
}

export interface GetterRef {
  type: 'getter';
  targetObjectId: number;
  getterObjectId: number;
}

export interface ValueRef {
  type: 'string' | 'number' | 'boolean' | 'bigint';
  value: string | number | boolean /*bigint transferred as string*/;
}

export interface SymbolRef {
  type: 'symbol';
  name: string;
  symbolId: number;
}

export interface UndefinedRef {
  type: 'undefined';
}

export interface NullRef {
  type: 'null';
}

export interface ObservableRef {
  type: 'observable';
  id: number;
  name: string;
  tags: string[];
  objectId: number;
  locations: Locations;
}

export interface SubscriberRef {
  type: 'subscriber';
  id: number;
  name: string;
  tags: string[];
  objectId: number;
  locations: Locations;
}

export type TargetRef = ObservableRef | SubscriberRef;

export interface EventRef {
  type: 'event';
  time: number;
  name: string;
  data?: Ref;
  eventType: 'subscribe' | 'unsubscribe' | 'next' | 'error' | 'complete';
  objectId: number;
}

export interface LocationRef {
  type: 'location';
  file: string;
  column: number;
  line: number;
  objectId?: number;
}

export interface TextRef {
  type: 'text';
  text: string;
  prefix?: string;
  suffix?: string;
}

// TODO: create TaskRef

export type Ref =
  | ObjectRef
  | ArrayRef
  | FunctionRef
  | SetRef
  | MapRef
  | MapEntryRef
  | EntriesRef
  | GetterRef
  | ValueRef
  | SymbolRef
  | UndefinedRef
  | NullRef
  | ObservableRef
  | SubscriberRef
  | EventRef
  | LocationRef
  | TextRef;
