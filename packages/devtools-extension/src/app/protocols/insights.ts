export const InsightsChannel = 'InsightsChannel';

export interface ObjectRef {
  type: 'object' | 'array' | 'function' | 'set' | 'map';
  refId: number;
  name: string;
  length: number;
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

export interface NilRef {
  type: 'null' | 'undefined';
}

export interface RxjsRef {
  type: 'observable' | 'subscriber';
  refId: number;
  id: number;
  name: string;
}

export type Ref = ObjectRef | ValueRef | SymbolRef | NilRef | RxjsRef;

export interface Location {}

export interface NotificationsStats {
  next: number;
  error: number;
  complete: number;
}

export interface SubscriptionsStats {
  active: number;
  errored: number;
  completed: number;
  unsubscribed: number;
}

export interface ObservableInfo {
  id: number;
  name: string;
  target: RxjsRef;
  internal: boolean;
  tags: string[];
  notifications: NotificationsStats;
  subscriptions: SubscriptionsStats;
  originalLocation?: Location;
  generatedLocation?: Location;
  ctor?: ObjectRef;
  args?: ObjectRef[];
  source?: RxjsRef;
}

export interface Insights {
  getObservableInfo(observableId: number): ObservableInfo | undefined;
}
