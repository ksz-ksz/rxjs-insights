import { Tracer } from './tracer';
import { Recorder } from './recorder';
import { Locator } from './locator';
import { Constructor, ObservableLike } from './types';

const ENV = Symbol.for('@rxjs-insights/env');

export interface InstrumentationContext {
  tracer: Tracer;
  locator: Locator;
  recorder: Recorder;
}

export interface Instrument<BASE> {
  <T extends BASE>(target: T, name?: string): T;
}

export interface Env {
  version: string;
  tracer: Tracer;
  locator: Locator;
  recorder: Recorder;
  instrumentConstructor: Instrument<Constructor<ObservableLike>>;
  instrumentCreator: Instrument<(...args: any[]) => ObservableLike>;
  instrumentOperator: Instrument<
    (...args: any[]) => (source: any) => ObservableLike
  >;
  instrumentSingleton: Instrument<ObservableLike>;
  instrumentCaller: Instrument<(...args: any[]) => any>;
}

export function setGlobalEnv(env: Env | null) {
  // @ts-ignore
  globalThis[ENV] = env;
}

export function getGlobalEnv(): Env {
  // @ts-ignore
  return globalThis[ENV];
}
