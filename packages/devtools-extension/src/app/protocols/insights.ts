import { ObservableRef, SubscriberRef } from '@app/protocols/refs';

export const InsightsChannel = 'InsightsChannel';

export interface RelatedObservable {
  id: number;
  name: string;
  tags: string[];
}

export interface RelatedSubscriber {
  id: number;
  startTime: number;
  endTime: number;
  observable: number;
}

export interface RelatedEvent {
  time: number;
  type: 'next' | 'error' | 'complete' | 'subscribe' | 'unsubscribe';
  name: string;
  target: {
    type: 'subscriber' | 'observable';
    id: number;
  };
  excluded: boolean;
  precedingEvent: number | undefined;
  succeedingEvents: number[];
}

export interface Relations {
  observables: Record<number, RelatedObservable>;
  subscribers: Record<number, RelatedSubscriber>;
  events: Record<number, RelatedEvent>;
}

export interface SubscriberState {
  ref: SubscriberRef;
  relations: Relations;
}

export interface ObservableState {
  ref: ObservableRef;
  relations: Relations;
}

export interface Insights {
  getObservableState(observableId: number): ObservableState | undefined;
  getSubscriberState(observableId: number): SubscriberState | undefined;
}
