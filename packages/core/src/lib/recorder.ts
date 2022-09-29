import { Locations, PromiseOrValue } from './locator';
import { InstrumentationContext } from './env';
import { ObservableLike } from './types';

declare const ref: unique symbol;
export type DeclarationRef = { readonly [ref]: 'ObservableDeclarationRef' };
export type ObservableRef = { readonly [ref]: 'ObservableRef' };
export type SubscriberRef = { readonly [ref]: 'SubscriberRef' };
export type CallerRef = { readonly [ref]: 'CallerRef' };
export type SubscriberEventRef = { readonly [ref]: 'SubscriberEventRef' };
export type ObservableEventRef = { readonly [ref]: 'ObservableEventRef' };
export type EventRef = SubscriberEventRef | ObservableEventRef;
export type TargetRef = ObservableRef | SubscriberRef | CallerRef;

export interface Recorder {
  init?(context: InstrumentationContext): void;

  declarationRef(
    name: string,
    func?: Function,
    args?: any[],
    locations?: PromiseOrValue<Locations>
  ): DeclarationRef;

  observableRef(
    target: ObservableLike,
    observableDeclarationRef: DeclarationRef,
    sourceObservableRef?: ObservableRef,
    internal?: boolean
  ): ObservableRef;

  subscriberRef(
    target: any[],
    observableRef: ObservableRef,
    destinationTargetRef: TargetRef | undefined
  ): SubscriberRef;

  callerRef(callerDeclarationRef: DeclarationRef): CallerRef;

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

  setInternal(observableRef: ObservableRef, internal: boolean): void;

  startTask(name: string): void;

  endTask(): void;
}
