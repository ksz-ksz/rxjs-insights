import {
  Observable,
  ObservableEvent,
  Subscriber,
  SubscriberEvent,
} from '@rxjs-insights/recorder';
import { subscriberSubscribers, observableSubscribers } from './subscribers';
import { subscriberSources, observableSources } from './sources';
import {
  eventPrecedingEvents,
  observablePrecedingEvents,
  subscriberPrecedingEvents,
} from './preceding-events';
import { subscriberEvents, observableEvents } from './events';
import { observableDestinations, subscriberDestinations } from './destinations';
import {
  eventSucceedingEvents,
  subscriberSucceedingEvents,
  observableSucceedingEvents,
} from './succeeding-events';
import { observableFlow, subscriberFlow } from './flow';

export class ObservableMore {
  static More = class More {
    constructor(readonly target: Observable) {}

    get ['inspect subscribers']() {
      observableSubscribers(this.target);
      return 'Done!';
    }

    get ['inspect events']() {
      observableEvents(this.target);
      return 'Done!';
    }

    get ['inspect source']() {
      observableSources(this.target);
      return 'Done!';
    }

    get ['inspect preceding events']() {
      observablePrecedingEvents(this.target);
      return 'Done!';
    }

    get ['inspect destinations']() {
      observableDestinations(this.target);
      return 'Done!';
    }

    get ['inspect succeeding events']() {
      observableSucceedingEvents(this.target);
      return 'Done!';
    }

    get ['inspect events flow']() {
      observableFlow(this.target);
      return 'Done!';
    }
  };
}

export class SubscriberMore {
  static More = class More {
    constructor(readonly target: Subscriber) {}

    get ['inspect subscribers']() {
      subscriberSubscribers(this.target);
      return 'Done!';
    }

    get ['inspect events']() {
      subscriberEvents(this.target);
      return 'Done!';
    }

    get ['inspect sources']() {
      subscriberSources(this.target);
      return 'Done!';
    }

    get ['inspect preceding events']() {
      subscriberPrecedingEvents(this.target);
      return 'Done!';
    }

    get ['inspect destinations']() {
      subscriberDestinations(this.target);
      return 'Done!';
    }

    get ['inspect succeeding events']() {
      subscriberSucceedingEvents(this.target);
      return 'Done!';
    }

    get ['inspect events flow']() {
      subscriberFlow(this.target);
      return 'Done!';
    }
  };
}

export class SubscriptionEventMore {
  static More = class More {
    readonly subscriber: any;

    constructor(readonly target: SubscriberEvent) {
      this.subscriber = new SubscriberMore.More(this.target.subscriber);
    }

    get ['inspect preceding events']() {
      eventPrecedingEvents(this.target);
      return 'Done!';
    }

    get ['inspect succeeding events']() {
      eventSucceedingEvents(this.target);
      return 'Done!';
    }
  };
}

export class ObservableEventMore {
  static More = class More {
    readonly observable: any;

    constructor(readonly target: ObservableEvent) {
      this.observable = new ObservableMore.More(this.target.observable);
    }

    get ['inspect preceding events']() {
      eventPrecedingEvents(this.target);
      return 'Done!';
    }

    get ['inspect succeeding events']() {
      eventSucceedingEvents(this.target);
      return 'Done!';
    }
  };
}
