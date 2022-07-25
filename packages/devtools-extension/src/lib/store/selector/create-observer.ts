import { SelectOptions, StoreView } from '@lib/store';
import { Observer } from 'rxjs';

class PullObserver<EMITS> implements Observer<unknown> {
  constructor(private readonly destination: Partial<Observer<EMITS>>) {}

  next(): void {
    this.destination.next?.(undefined as any);
  }

  error(err: any): void {
    this.destination.error?.(err);
  }

  complete(): void {
    this.destination.complete?.();
  }
}

class PushObserver<EMITS> implements Observer<unknown> {
  constructor(
    private readonly destination: Partial<Observer<EMITS>>,
    private readonly view: StoreView<EMITS>
  ) {}

  next(): void {
    this.destination.next?.(this.view.get());
  }

  error(err: any): void {
    this.destination.error?.(err);
  }

  complete(): void {
    this.destination.complete?.();
  }
}

export function createObserver<EMITS>(
  store: StoreView<EMITS>,
  observer: Partial<Observer<EMITS>>,
  { mode = 'push' }: SelectOptions = {}
) {
  return mode === 'push'
    ? new PushObserver(observer, store)
    : new PullObserver(observer);
}
