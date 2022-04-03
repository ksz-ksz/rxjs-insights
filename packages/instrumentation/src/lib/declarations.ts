import { Constructor, ObservableLike } from './types';
import { getGlobalEnv } from './env';

const env = getGlobalEnv();

const identityDeclaration: <T>(name: string, target: T) => T = (name, target) =>
  target;

export const declareConstructor: <T extends Constructor<ObservableLike>>(
  name: string,
  target: T
) => T = env ? env.instrumentConstructor : identityDeclaration;

export const declareCreator: <T extends (...args: any[]) => ObservableLike>(
  name: string,
  target: T
) => T = env ? env.instrumentCreator : identityDeclaration;

export const declareOperator: <
  T extends (...args: any[]) => (source: any) => ObservableLike
>(
  name: string,
  target: T
) => T = env ? env.instrumentOperator : identityDeclaration;

export const declareSingleton: <T extends ObservableLike>(
  name: string,
  target: T
) => T = env ? env.instrumentSingleton : identityDeclaration;
