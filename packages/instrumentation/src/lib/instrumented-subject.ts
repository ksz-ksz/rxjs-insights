import { InstrumentationContext } from './env';
import { Complete, Error, Next, SubjectLike } from './types';
import { getObservableRef } from './get-observable-ref';

export function createInstrumentedSubjectNext(
  context: InstrumentationContext,
  next: Next
) {
  return function instrumentedNext(this: SubjectLike, data: any) {
    if (this.closed) {
      return next(data);
    }
    const subjectRef = getObservableRef(context, this);
    const eventDeclarationRef = context.recorder.declarationRef('next', next, [
      data,
    ]);
    const sourceEventRef = context.tracer.getTrace()?.eventRef;
    const eventRef = context.recorder.observableEventRef(
      eventDeclarationRef,
      subjectRef,
      sourceEventRef
    );
    context.tracer.run({ eventRef, observableRef: subjectRef }, () =>
      next.call(this, data)
    );
  };
}

export function createInstrumentedSubjectError(
  context: InstrumentationContext,
  error: Error
) {
  return function instrumentedError(this: SubjectLike, data: any) {
    if (this.closed) {
      return error(data);
    }
    const subjectRef = getObservableRef(context, this);
    const eventDeclarationRef = context.recorder.declarationRef(
      'error',
      error,
      [data]
    );
    const sourceEventRef = context.tracer.getTrace()?.eventRef;
    const eventRef = context.recorder.observableEventRef(
      eventDeclarationRef,
      subjectRef,
      sourceEventRef
    );
    context.tracer.run({ eventRef, observableRef: subjectRef }, () =>
      error.call(this, data)
    );
  };
}

export function createInstrumentedSubjectComplete(
  context: InstrumentationContext,
  complete: Complete
) {
  return function instrumentedComplete(this: SubjectLike) {
    if (this.closed) {
      return complete();
    }
    const subjectRef = getObservableRef(context, this);
    const eventDeclarationRef = context.recorder.declarationRef(
      'complete',
      complete,
      []
    );
    const sourceEventRef = context.tracer.getTrace()?.eventRef;
    const eventRef = context.recorder.observableEventRef(
      eventDeclarationRef,
      subjectRef,
      sourceEventRef
    );
    context.tracer.run({ eventRef, observableRef: subjectRef }, () =>
      complete.call(this)
    );
  };
}
