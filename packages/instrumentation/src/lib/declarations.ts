import { Constructor, ObservableLike } from './types';
import { getGlobalEnv } from './env';

export function declareConstructor<T extends Constructor<ObservableLike>>(
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

export function declareCreator<T extends (...args: any[]) => ObservableLike>(
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

export function declareOperator<
  T extends (...args: any[]) => (source: any) => ObservableLike
>(name: string, target: T): T {
  const env = getGlobalEnv();
  if (env) {
    return env.instrumentOperator(name, target);
  } else {
    return target;
  }
}

export function declareSingleton<T extends ObservableLike>(
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
