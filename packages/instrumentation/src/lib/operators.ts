import { Observable } from 'rxjs';
import { getGlobalEnv } from './env';

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
          env.addTag(source, tag);
          return source;
        };
      }
    : identityOperator;
