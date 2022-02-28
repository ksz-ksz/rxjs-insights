/// <reference types="zone.js" />
import { Tracer } from '@rxjs-insights/instrumentation';
import { SchedulerLike, SchedulerTracer } from './scheduler-tracer';
import { ZonejsTracer } from './zonejs-tracer';

function isZoneJs() {
  return Boolean(
    typeof Zone !== 'undefined' && Zone && Zone.root && Zone.current
  );
}

export function getTracer(schedulers: Record<string, SchedulerLike>): Tracer {
  return isZoneJs() ? new ZonejsTracer() : new SchedulerTracer(schedulers);
}
