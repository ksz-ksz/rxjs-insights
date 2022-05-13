import { Locations } from './locator';
import { InstrumentationContext } from './env';
import { ObservableLike, SubscriberLike } from './types';

declare const ref: unique symbol;
export type DeclarationRef = { readonly [ref]: 'ObservableDeclarationRef' };
export type ObservableRef = { readonly [ref]: 'ObservableRef' };
export type SubscriberRef = { readonly [ref]: 'SubscriberRef' };
export type SubscriberEventRef = { readonly [ref]: 'SubscriberEventRef' };
export type ObservableEventRef = { readonly [ref]: 'ObservableEventRef' };
export type EventRef = SubscriberEventRef | ObservableEventRef;

export interface RecorderStats {
  observables: Record<string, number>;
  subscribers: Record<string, number>;
  events: Record<string, number>;
}

export interface Recorder {
  init?(context: InstrumentationContext): void;

  getStats(): RecorderStats;

  declarationRef(
    name: string,
    func?: Function,
    args?: any[],
    locations?: Promise<Locations>,
    internal?: boolean
  ): DeclarationRef;

  observableRef(
    target: ObservableLike,
    observableDeclarationRef: DeclarationRef,
    sourceObservableRef?: ObservableRef
  ): ObservableRef;

  subscriberRef(
    target: any[],
    observableRef: ObservableRef,
    destinationObservableRef: ObservableRef | undefined
  ): SubscriberRef;

  observableEventRef(
    eventDeclarationRef: DeclarationRef,
    observableRef: ObservableRef,
    sourceEventRef: EventRef | undefined
  ): ObservableEventRef;

  subscriberEventRef(
    eventDeclarationRef: DeclarationRef,
    subscriberRef: SubscriberRef,
    sourceEventRef: EventRef | undefined
  ): SubscriberEventRef;

  addTag(observableRef: ObservableRef, tag: string): void;

  startTask(name: string): void;

  endTask(): void;
}
