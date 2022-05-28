export const RefsChannel = 'RefsChannel';

export interface PropertyRef {
  key: string | number;
  val: Ref;
  type: 'enumerable' | 'nonenumerable' | 'special';
}

export interface Refs {
  expand(refId: number): PropertyRef[];
  invokeGetter(refId: number): Ref;
}

export interface ObjectRef {
  type: 'object';
  refId: number;
  name: string;
}

export interface ArrayRef {
  type: 'array';
  refId: number;
  name: string;
  length: number;
}

export interface FunctionRef {
  type: 'function';
  refId: number;
  name: string;
}

export interface SetRef {
  type: 'set';
  refId: number;
  name: string;
  size: number;
}

export interface MapRef {
  type: 'map';
  refId: number;
  name: string;
  size: number;
}

export interface MapEntryRef {
  type: 'map-entry';
  refId: number;
  name: string;
}

export interface EntriesRef {
  type: 'entries';
  refId: number;
}

export interface GetterRef {
  type: 'getter';
  refId: number;
}

export interface ValueRef {
  type: 'string' | 'number' | 'boolean' | 'bigint';
  value: string | number | boolean | bigint;
}

export interface SymbolRef {
  type: 'symbol';
  refId: number;
  name: string;
}

export interface UndefinedRef {
  type: 'undefined';
}

export interface NullRef {
  type: 'null';
}

export interface ObservableRef {
  type: 'observable';
  refId: number;
  id: number;
  name: string;
}

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
  | SubscriberRef;

export interface SubscriberRef {
  type: 'subscriber';
  refId: number;
  id: number;
  name: string;
}