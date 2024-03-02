import {
  from,
  Observable,
  ObservableInput,
  ObservedValueOf,
  OperatorFunction,
  Subject,
} from 'rxjs';

export function connectSubject<
  TConnector extends Subject<any>,
  TResult extends ObservableInput<unknown>
>(
  selector: (subject: TConnector) => TResult,
  { connector }: { connector: () => TConnector }
): OperatorFunction<ObservedValueOf<TConnector>, ObservedValueOf<TResult>> {
  return (source) =>
    new Observable<ObservedValueOf<TResult>>((subscriber) => {
      const subject = connector();
      subscriber.add(source.subscribe(subject));
      from(selector(subject)).subscribe(subscriber);
    });
}
