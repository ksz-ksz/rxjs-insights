import { Observable, Subscriber } from 'rxjs';
import { Action } from '@lib/state-fx/store';

export class ActionSource<T> extends Observable<Action<T>> {
  private readonly subscribers: Subscriber<Action<T>>[] = [];
  private currentSubscribers: Subscriber<Action<T>>[] | undefined = undefined;

  constructor(
    private readonly namespace: string,
    private readonly name: string
  ) {
    super((subscriber) => {
      this.subscribers.push(subscriber);
      this.currentSubscribers = undefined;

      return () => {
        const indexOfSubscriber = this.subscribers.indexOf(subscriber);
        this.subscribers.splice(indexOfSubscriber, 1);
        this.currentSubscribers = undefined;
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
    if (this.currentSubscribers === undefined) {
      this.currentSubscribers = Array.from(this.subscribers);
    }
    for (const subscriber of this.currentSubscribers) {
      subscriber.next(action);
    }
  }
}
