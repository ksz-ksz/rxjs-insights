import { Tracer } from './tracer';
import { Recorder } from './recorder';
import { Locator } from './locator';
import { Constructor, ObservableLike, SubjectLike } from './types';

const ENV = Symbol('@rxjs-insights/env');

export interface InstrumentationContext {
  Subject: Constructor<SubjectLike>;
  tracer: Tracer;
  locator: Locator;
  recorder: Recorder;
}

export interface Instrument<BASE> {
  <T extends BASE>(target: T, name?: string): T;
}

export interface Env {
  instrumentConstructor: Instrument<Constructor<ObservableLike>>;
  instrumentCreator: Instrument<(...args: any[]) => ObservableLike>;
  instrumentOperator: Instrument<
    (...args: any[]) => (source: any) => ObservableLike
  >;
  instrumentSingleton: Instrument<ObservableLike>;
  addTag: (observable: ObservableLike, tag: string) => void;
}

export function setGlobalEnv(env: Env) {
  // @ts-ignore
  globalThis[ENV] = env;
}

export function getGlobalEnv(): Env {
  // @ts-ignore
  return globalThis[ENV];
}
