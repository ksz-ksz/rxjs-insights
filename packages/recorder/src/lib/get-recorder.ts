import { Recorder } from '@rxjs-insights/instrumentation';
import { ModelRecorder } from './model-recorder';

export function getRecorder(): Recorder {
  return new ModelRecorder();
}
