import { Trace, TraceFrame, Traces } from '@app/protocols/traces';
import { RefsService } from './refs-service';
import { getGlobalEnv } from '@rxjs-insights/core';
import { deref, Event } from '@rxjs-insights/recorder';
import { EventRef, TargetRef } from '@app/protocols/refs';

export class TracesService implements Traces {
  constructor(private readonly refs: RefsService) {}

  getTrace() {
    const env = getGlobalEnv();
    if (env) {
      const event = deref(env.tracer.getTrace()?.eventRef);
      return this.getTraceImpl(event);
    } else {
      return undefined;
    }
  }

  private getTraceImpl(event: Event | undefined): Trace {
    if (event === undefined) {
      return [];
    } else {
      const frame: TraceFrame = {
        task: {
          id: event.task.id,
          name: event.task.name,
        },
        event: this.refs.create(event) as EventRef,
        target: this.refs.create(event.target) as TargetRef,
        locations: event.target.declaration.locations,
      };
      return [frame, ...this.getTraceImpl(event.precedingEvent)];
    }
  }
}
