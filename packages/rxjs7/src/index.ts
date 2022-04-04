import {
  animationFrameScheduler,
  asapScheduler,
  asyncScheduler,
  Observable,
  queueScheduler,
  Subject,
  Subscriber,
} from '@rxjs-insights/rxjs-alias-module';
import { install } from '@rxjs-insights/core';
import { getRecorder } from '@rxjs-insights/recorder';
import { getLocator } from '@rxjs-insights/locator';
import { getTracer } from '@rxjs-insights/tracer';

declare const RXJS_INSIGHTS_INSTALL: boolean | undefined;

if (typeof RXJS_INSIGHTS_INSTALL !== 'undefined' && RXJS_INSIGHTS_INSTALL) {
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
}
