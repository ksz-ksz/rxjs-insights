import {
  animationFrameScheduler,
  asapScheduler,
  asyncScheduler,
  Observable,
  queueScheduler,
  Subject,
  Subscriber,
} from '@rxjs-insights/rxjs-alias';
import {
  install as _install,
  Locator,
  Recorder,
  Tracer,
} from '@rxjs-insights/instrumentation';
import { getRecorder } from '@rxjs-insights/recorder';
import { getLocator } from '@rxjs-insights/locator';
import { getTracer } from '@rxjs-insights/tracer';

export function install({
  recorder = getRecorder(),
  locator = getLocator(),
  tracer = getTracer({
    asyncScheduler,
    asapScheduler,
    queueScheduler,
    animationFrameScheduler,
  }),
}: { recorder?: Recorder; locator?: Locator; tracer?: Tracer } = {}) {
  _install({
    Observable,
    Subject,
    Subscriber,
    recorder,
    locator,
    tracer,
  });
}
