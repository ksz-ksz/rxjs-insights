import { Recorder } from '@rxjs-insights/core';
import { ModelRecorder } from './model-recorder';

export function getRecorder(): Recorder {
  return new ModelRecorder();
}
