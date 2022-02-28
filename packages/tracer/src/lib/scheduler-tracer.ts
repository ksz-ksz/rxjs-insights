import {
  HasMeta,
  InstrumentationContext,
  Recorder,
  SubscriptionLike,
  Trace,
  Tracer,
} from '@rxjs-insights/instrumentation';
import { queueCleanup } from './queue-cleanup';

export interface SchedulerLike {
  now(): number;

  schedule(...args: any[]): SubscriptionLike;
}

interface SchedulerMeta {
  name: string;
  schedule: SchedulerLike['schedule'];
  contextTracker: SchedulerTracer;
}

function createInstrumentedSchedule(
  schedule: (...args: any[]) => SubscriptionLike,
  name: string,
  tracer: SchedulerTracer,
  recorder: Recorder
) {
  return function instrumentedSchedule(
    this: SchedulerLike & HasMeta<SchedulerMeta>,
    work: (this: any, state?: any) => void,
    delay?: number,
    state?: any
  ): SubscriptionLike {
    const contextState = tracer.getTrace();
    return schedule.call(
      this,
      function (this: any, state?: any) {
        recorder.startTask(`${name}${delay ? `(delay: ${delay}ms)` : ''}`);
        queueCleanup(() => void recorder.endTask());
        tracer.setState(contextState);
        return work.call(this, state);
      },
      delay,
      state
    );
  };
}

export class SchedulerTracer implements Tracer {
  private trace: Trace | undefined;

  constructor(private readonly schedulers: Record<string, SchedulerLike>) {}

  init(context: InstrumentationContext) {
    for (let [name, scheduler] of Object.entries(this.schedulers)) {
      this.instrumentScheduler(name, scheduler, context.recorder);
    }
  }

  run<T>(state: Trace, run: () => T): T {
    const prevState = this.trace;
    try {
      this.trace = { ...this.trace, ...state };
      return run();
    } finally {
      this.trace = prevState;
    }
  }

  getTrace(): Trace | undefined {
    return this.trace;
  }

  setState(state: Trace | undefined): void {
    this.trace = state;
  }

  private instrumentScheduler(
    name: string,
    scheduler: SchedulerLike,
    recorder: Recorder
  ): void {
    Object.defineProperty(scheduler, 'schedule', {
      value: createInstrumentedSchedule(
        scheduler.schedule,
        name,
        this,
        recorder
      ),
    });
  }
}
