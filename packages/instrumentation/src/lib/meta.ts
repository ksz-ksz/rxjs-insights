import { ObservableRef, SubscriberRef } from './recorder';
import { ObservableLike, SubscriberLike } from './types';

const META = Symbol('@@meta');

export type MetaOf<T> = T extends ObservableLike
  ? ObservableMeta
  : T extends SubscriberLike
  ? SubscriberMeta
  : never;

export interface HasMeta<M> {
  [META]: M;
}

export interface ObservableMeta {
  observableRef: ObservableRef;
}

export interface SubscriberMeta {
  subscriberRef: SubscriberRef;
}

export function getMeta<M>(target: HasMeta<M>): M {
  const meta = target[META];
  if (meta !== undefined) {
    return meta;
  } else {
    throw new Error('meta not found on target');
  }
}

export function hasMeta<T>(target: T): target is T & HasMeta<MetaOf<T>> {
  return (target as any)[META] !== undefined;
}

export function setMeta<T>(target: T, meta: MetaOf<T>): MetaOf<T> {
  (target as any)[META] = meta;
  return meta;
}

export function hasAnyMeta<T>(target: T): target is T & HasMeta<any> {
  return (target as any)[META] !== undefined;
}

export function setAnyMeta<M>(target: any, meta: M): M {
  (target as any)[META] = meta;
  return meta;
}
