import { EventRef, ObservableRef, SubscriberRef } from '@app/protocols/refs';

export const InsightsChannel = 'InsightsChannel';

export interface RelatedTarget {
  id: number;
  type: 'subscriber' | 'observable';
  name: string;
  tags: string[];
  startTime: number;
  endTime: number;
}

export interface TargetId {
  type: 'subscriber' | 'observable';
  id: number;
}

export interface RelatedTask {
  id: number;
  name: string;
}

export interface RelatedEvent extends EventRef {
  time: number;
  eventType: 'next' | 'error' | 'complete' | 'subscribe' | 'unsubscribe';
  name: string;
  target: TargetId;
  task: number;
  precedingEvent: number | undefined;
  succeedingEvents: number[];
}

export interface RelatedHierarchyNode {
  target: TargetId;
  children: RelatedHierarchyNode[];
}

export interface RelatedHierarchyTree {
  sources: RelatedHierarchyNode;
  destinations: RelatedHierarchyNode;
}

export interface Relations {
  observables: Record<number, RelatedTarget>;
  subscribers: Record<number, RelatedTarget>;
  events: Record<number, RelatedEvent>;
  tasks: Record<number, RelatedTask>;
}

export interface SubscriberState {
  ref: SubscriberRef;
  relations: Relations;
  hierarchy: RelatedHierarchyTree;
}

export interface ObservableState {
  ref: ObservableRef;
  relations: Relations;
  hierarchy: RelatedHierarchyTree;
}

export interface Insights {
  getObservableState(observableId: number): ObservableState | undefined;
  getSubscriberState(subscriberId: number): SubscriberState | undefined;
}
