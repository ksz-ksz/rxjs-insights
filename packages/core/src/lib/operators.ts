import { Observable } from 'rxjs';
import { getGlobalEnv } from './env';
import { getMeta, hasMeta } from './meta';

const env = getGlobalEnv();

export function identityOperator<T>(): (
  source: Observable<T>
) => Observable<T> {
  return (source) => source;
}

export const tag: <T>(tag: string) => (source: Observable<T>) => Observable<T> =
  env
    ? function tagOperator<T>(
        tag: string
      ): (source: Observable<T>) => Observable<T> {
        return (source) => {
          if (hasMeta(source)) {
            env.recorder.addTag(getMeta(source).observableRef, tag);
          }
          return source;
        };
      }
    : identityOperator;

export const internal: <T>(
  internal?: boolean
) => (source: Observable<T>) => Observable<T> = env
  ? function internalOperator<T>(
      internal: boolean = true
    ): (source: Observable<T>) => Observable<T> {
      return (source) => {
        if (hasMeta(source)) {
          env.recorder.setInternal(getMeta(source).observableRef, internal);
        }
        return source;
      };
    }
  : identityOperator;
