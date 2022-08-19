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

export interface Connect {
  (): SubscriptionLike;
}

export interface ObservableLike {
  subscribe: Subscribe;
}

export interface ConnectableObservableLike extends ObservableLike {
  connect: Connect;
}

export interface ObserverLike {
  next: Next;
  error: Error;
  complete: Complete;
}

export interface SubjectLike extends ObservableLike, SubscriberLike {}

export interface SubscriptionLike {
  closed: boolean;
  unsubscribe: Unsubscribe;
}

export interface SubscriberLike extends SubscriptionLike, ObserverLike {}

export interface Constructor<T> {
  new (...args: any[]): T;
}
