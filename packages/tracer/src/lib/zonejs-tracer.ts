/// <reference types="zone.js" />
import {
  InstrumentationContext,
  Recorder,
  Trace,
  Tracer,
} from '@rxjs-insights/instrumentation';

export class ZonejsTracer implements Tracer {
  private recorder!: Recorder;

  init(context: InstrumentationContext) {
    this.recorder = context.recorder;
  }

  run<T>(state: Trace, run: () => T): T {
    const recorder = this.recorder;
    return Zone.current
      .fork({
        name: 'ContextTrackerZone',
        properties: {
          trace: state,
        },
        onInvokeTask(delegate, current, target, task, applyThis, applyArgs) {
          try {
            recorder.startTask(
              `${task.source}${
                task.data?.delay ? `(delay: ${task.data.delay}ms)` : ''
              }`
            );
            delegate.invokeTask(target, task, applyThis, applyArgs);
          } finally {
            recorder.endTask();
          }
        },
      })
      .run(run);
  }

  getTrace(): Trace | undefined {
    return Zone.current.get('trace');
  }
}
