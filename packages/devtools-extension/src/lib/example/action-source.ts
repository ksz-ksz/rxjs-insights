import { Observable, Subscriber } from 'rxjs';
import { Action } from '@lib/state-fx/store';

export class ActionSource<T> extends Observable<Action<T>> {
  private readonly subscribers: Subscriber<Action<T>>[] = [];

  constructor(
    private readonly namespace: string,
    private readonly name: string
  ) {
    super((subscriber) => {
      this.subscribers.push(subscriber);

      return () => {
        const indexOfSubscriber = this.subscribers.indexOf(subscriber);
        this.subscribers.splice(indexOfSubscriber, 1);
      };
    });
  }

  dispatch(payload: T) {
    this.dispatchAction({
      namespace: this.namespace,
      name: this.name,
      payload,
    });
  }

  dispatchAction(action: Action<T>) {
    for (const subscriber of this.subscribers) {
      subscriber.next(action);
    }
  }
}
