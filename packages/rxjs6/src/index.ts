import {
  animationFrameScheduler,
  asapScheduler,
  asyncScheduler,
  Observable,
  queueScheduler,
  Subject,
  Subscriber,
} from '@rxjs-insights/rxjs-alias-module';
import { install } from '@rxjs-insights/instrumentation';
import { getRecorder } from '@rxjs-insights/recorder';
import { getLocator } from '@rxjs-insights/locator';
import { getTracer } from '@rxjs-insights/tracer';

declare const INSTALL_RXJS_INSIGHTS: boolean | undefined;

if (typeof INSTALL_RXJS_INSIGHTS !== 'undefined' && INSTALL_RXJS_INSIGHTS) {
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
