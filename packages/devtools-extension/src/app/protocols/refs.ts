export const RefsChannel = 'RefsChannel';

export interface PropertyRef {
  key: string;
  val: Ref;
  enumerable: boolean;
}

export interface Refs {
  expand(refId: number):
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
      };
  invokeGetter(refId: number): {
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
  refId: number;
  value: string | number | boolean | bigint;
}

export interface SymbolRef {
  type: 'symbol';
  refId: number;
  name: string;
}

export interface UndefinedRef {
  type: 'undefined';
  refId: number;
}

export interface NullRef {
  type: 'null';
  refId: number;
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
