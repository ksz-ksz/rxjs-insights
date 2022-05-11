import { Observable } from 'rxjs';

export function fromChromeEvent<T extends (...args: any[]) => any>(
  event: chrome.events.Event<T>
): Observable<Parameters<T>> {
  return new Observable<Parameters<T>>((observer) => {
    const callback = (...args: Parameters<T>) => {
      observer.next(args);
    };
    event.addListener(callback as any);

    return () => {
      event.removeListener(callback as any);
    };
  });
}
