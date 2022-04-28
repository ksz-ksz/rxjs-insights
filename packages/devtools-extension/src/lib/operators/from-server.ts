import { Observable, Observer } from 'rxjs';
import { Server } from '@lib/rpc';

export function fromServer<T>(start: (observer: Observer<T>) => Server) {
  return new Observable<T>((observer) => {
    const server = start(observer);

    return () => server.stop();
  });
}
