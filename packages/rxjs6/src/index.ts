import {
  animationFrameScheduler,
  asapScheduler,
  asyncScheduler,
  Observable,
  queueScheduler,
  Subject,
  Subscriber,
} from '@rxjs-insights/rxjs-module';
import { install } from '@rxjs-insights/core';
import { getRecorder } from '@rxjs-insights/recorder';
import { getLocator } from '@rxjs-insights/locator';
import { getTracer } from '@rxjs-insights/tracer';
import { patchObjectCreate } from './patch-object-create';

patchObjectCreate();

install({
  Observable,
  Subject,
  Subscriber,
  recorder: getRecorder(),
  locator: getLocator(),
  tracer: getTracer({
    asyncScheduler,
    asapScheduler,
    queueScheduler,
    animationFrameScheduler,
  }),
});
