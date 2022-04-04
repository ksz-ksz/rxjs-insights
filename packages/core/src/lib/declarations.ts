import { Observable } from 'rxjs';
import { getGlobalEnv } from './env';

const env = getGlobalEnv();

const identityDeclaration: <T>(target: T) => T = (target) => target;

export const declareConstructor: <
  T extends new (...args: any[]) => Observable<any>
>(
  target: T,
  name?: string
) => T = env ? env.instrumentConstructor : identityDeclaration;

export const declareCreator: <T extends (...args: any[]) => Observable<any>>(
  target: T,
  name?: string
) => T = env ? env.instrumentCreator : identityDeclaration;

export const declareOperator: <
  T extends (...args: any[]) => (source: any) => Observable<any>
>(
  target: T,
  name?: string
) => T = env ? env.instrumentOperator : identityDeclaration;

export const declareSingleton: <T extends Observable<any>>(
  target: T,
  name?: string
) => T = env ? env.instrumentSingleton : identityDeclaration;
