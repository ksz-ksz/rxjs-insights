import { Env, InstrumentationContext, setGlobalEnv } from './env';
import { createInstrumentedSubscribe } from './instrumented-subscribe';
import { Recorder } from './recorder';
import { Locator } from './locator';
import { Tracer } from './tracer';
import {
  Constructor,
  ObservableLike,
  SubjectLike,
  SubscriberLike,
} from './types';
import { createInstrumentConstructor } from './instrument-constructor';
import { createInstrumentCreator } from './instrument-creator';
import { createInstrumentOperator } from './instrument-operator';
import { createInstrumentSingleton } from './instrument-singleton';
import {
  createInstrumentedSubjectComplete,
  createInstrumentedSubjectError,
  createInstrumentedSubjectNext,
} from './instrumented-subject';
import { createAddTag } from './add-tag';
import { createInstrumentCaller } from './instrument-caller';

export interface Config {
  Observable: Constructor<ObservableLike>;
  Subject: Constructor<SubjectLike>;
  Subscriber: Constructor<SubscriberLike>;
  tracer: Tracer;
  locator: Locator;
  recorder: Recorder;
}

export function instrument({
  Observable,
  Subject,
  Subscriber,
  tracer,
  locator,
  recorder,
}: Config): Env {
  const context: InstrumentationContext = {
    Subject,
    recorder,
    tracer,
    locator,
  };

  Observable.prototype.subscribe = createInstrumentedSubscribe(
    context,
    Observable.prototype.subscribe,
    Subscriber
  );

  Subject.prototype.next = createInstrumentedSubjectNext(
    context,
    Subject.prototype.next
  );

  Subject.prototype.error = createInstrumentedSubjectError(
    context,
    Subject.prototype.error
  );

  Subject.prototype.complete = createInstrumentedSubjectComplete(
    context,
    Subject.prototype.complete
  );

  if (locator.init) {
    locator.init(context);
  }
  if (tracer.init) {
    tracer.init(context);
  }
  if (recorder.init) {
    recorder.init(context);
  }

  return {
    tracer,
    locator,
    recorder,
    instrumentConstructor: createInstrumentConstructor(context),
    instrumentCreator: createInstrumentCreator(context),
    instrumentOperator: createInstrumentOperator(context),
    instrumentSingleton: createInstrumentSingleton(context),
    instrumentCaller: createInstrumentCaller(context),
    addTag: createAddTag(context),
  };
}

declare const RXJS_INSIGHTS_INSTALL: boolean | undefined;

export function install(config: Config) {
  if (typeof RXJS_INSIGHTS_INSTALL !== 'undefined' && RXJS_INSIGHTS_INSTALL) {
    setGlobalEnv(instrument(config));
  } else {
    setGlobalEnv(null);
  }
}
