export interface Subscribe {
  (...args: any[]): SubscriptionLike;
}

export interface Unsubscribe {
  (): void;
}

export interface Next {
  (value: any): void;
}

export interface Error {
  (error: any): void;
}

export interface Complete {
  (): void;
}

export interface ObservableLike {
  subscribe(...args: any[]): SubscriptionLike;
}

export interface ObserverLike {
  next(value: any): void;
  error(error: any): void;
  complete(): void;
}

export interface SubjectLike extends ObservableLike, SubscriberLike {}

export interface SubscriptionLike {
  closed: boolean;
  unsubscribe(): void;
}

export interface SubscriberLike extends SubscriptionLike, ObserverLike {}

export interface Constructor<T> {
  new (...args: any[]): T;
}
