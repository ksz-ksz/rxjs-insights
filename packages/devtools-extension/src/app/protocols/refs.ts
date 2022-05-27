export const RefsChannel = 'RefsChannel';

export interface PropertyRef {
  key: string;
  value: Ref;
  enumerable: boolean;
}

export interface Refs {
  expand(
    ref: ObjectRef | ArrayRef | FunctionRef | ObservableRef | SubscriberRef
  ): {
    props: PropertyRef[];
    proto: Ref;
  };
  expandSet(ref: SetRef): {
    entries: Ref[];
    props: PropertyRef[];
    proto: Ref;
  };
  expandMap(ref: MapRef): {
    entries: [Ref, Ref][];
    props: PropertyRef[];
    proto: Ref;
  };
  expandGetter(ref: GetterRef): {
    value: Ref;
  };
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
  name: string;
  refId: number;
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

export interface SubscriberRef {
  type: 'subscriber';
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
  | GetterRef
  | ValueRef
  | SymbolRef
  | UndefinedRef
  | NullRef
  | ObservableRef
  | SubscriberRef;
