import { ObservableLike } from './types';
import { getGlobalEnv } from './env';
import { Observable } from 'rxjs';

export function tag<T>(tag: string): (source: Observable<T>) => Observable<T> {
  const env = getGlobalEnv();
  if (env) {
    return (source) => {
      env.addTag(source, tag);
      return source;
    };
  } else {
    return (source) => source;
  }
}
