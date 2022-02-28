import { Constructor, ObservableLike } from './types';
import { getGlobalEnv } from './env';

export function constructor<T extends Constructor<ObservableLike>>(
  name: string,
  target: T
): T {
  const env = getGlobalEnv();
  if (env) {
    return env.instrumentConstructor(name, target);
  } else {
    return target;
  }
}

export function creator<T extends (...args: any[]) => ObservableLike>(
  name: string,
  target: T
): T {
  const env = getGlobalEnv();
  if (env) {
    return env.instrumentCreator(name, target);
  } else {
    return target;
  }
}

export function operator<
  T extends (...args: any[]) => (source: any) => ObservableLike
>(name: string, target: T): T {
  const env = getGlobalEnv();
  if (env) {
    return env.instrumentOperator(name, target);
  } else {
    return target;
  }
}

export function singleton<T extends ObservableLike>(
  name: string,
  target: T
): T {
  const env = getGlobalEnv();
  if (env) {
    return env.instrumentSingleton(name, target);
  } else {
    return target;
  }
}
