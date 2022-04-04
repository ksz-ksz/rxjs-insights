import { Observable } from 'rxjs';
import { getGlobalEnv } from './env';

const env = getGlobalEnv();

const identityDeclaration: <T>(name: string, target: T) => T = (name, target) =>
  target;

export const declareConstructor: <
  T extends new (...args: any[]) => Observable<any>
>(
  name: string,
  target: T
) => T = env ? env.instrumentConstructor : identityDeclaration;

export const declareCreator: <T extends (...args: any[]) => Observable<any>>(
  name: string,
  target: T
) => T = env ? env.instrumentCreator : identityDeclaration;

export const declareOperator: <
  T extends (...args: any[]) => (source: any) => Observable<any>
>(
  name: string,
  target: T
) => T = env ? env.instrumentOperator : identityDeclaration;

export const declareSingleton: <T extends Observable<any>>(
  name: string,
  target: T
) => T = env ? env.instrumentSingleton : identityDeclaration;
