import {
  Observable,
  ObservableEvent,
  Subscriber,
  SubscriberEvent,
} from '@rxjs-insights/recorder';
import {
  subscriberSubscribers,
  observableSubscribers,
} from './inspectSubscribers';
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
} from './inspect-succeeding-events';
import { observableFlow, subscriberFlow } from './inspect-events-flow';
import {
  observableEventInfo,
  observableInfo,
  subscriberEventInfo,
  subscriberInfo,
} from './info';

export namespace ObservableMore {
  export class More {
    constructor(readonly target: Observable) {}

    get ['0. inspect']() {
      observableInfo(this.target);
      return 'Done!';
    }

    get ['1. inspect subscribers']() {
      observableSubscribers(this.target);
      return 'Done!';
    }

    get ['2. inspect source subscribers']() {
      observableSources(this.target);
      return 'Done!';
    }

    get ['3. inspect destination subscribers']() {
      observableDestinations(this.target);
      return 'Done!';
    }

    get ['4. inspect events']() {
      observableEvents(this.target);
      return 'Done!';
    }

    get ['5. inspect preceding events']() {
      observablePrecedingEvents(this.target);
      return 'Done!';
    }

    get ['6. inspect succeeding events']() {
      observableSucceedingEvents(this.target);
      return 'Done!';
    }

    get ['7. inspect events flow']() {
      observableFlow(this.target);
      return 'Done!';
    }
  }
}

export namespace SubscriberMore {
  export class More {
    constructor(readonly target: Subscriber) {}

    get ['0. inspect']() {
      subscriberInfo(this.target);
      return 'Done!';
    }

    get ['1. inspect subscribers']() {
      subscriberSubscribers(this.target);
      return 'Done!';
    }

    get ['2. inspect source subscribers']() {
      subscriberSources(this.target);
      return 'Done!';
    }

    get ['3. inspect destination subscribers']() {
      subscriberDestinations(this.target);
      return 'Done!';
    }

    get ['4. inspect events']() {
      subscriberEvents(this.target);
      return 'Done!';
    }

    get ['5. inspect preceding events']() {
      subscriberPrecedingEvents(this.target);
      return 'Done!';
    }

    get ['6. inspect succeeding events']() {
      subscriberSucceedingEvents(this.target);
      return 'Done!';
    }

    get ['7. inspect events flow']() {
      subscriberFlow(this.target);
      return 'Done!';
    }
  }
}

export namespace SubscriptionEventMore {
  export class More {
    readonly subscriber: any;

    constructor(readonly target: SubscriberEvent) {
      this.subscriber = new SubscriberMore.More(this.target.target);
    }

    get ['0. inspect']() {
      subscriberEventInfo(this.target);
      return 'Done!';
    }

    get ['1. inspect preceding events']() {
      eventPrecedingEvents(this.target);
      return 'Done!';
    }

    get ['2. inspect succeeding events']() {
      eventSucceedingEvents(this.target);
      return 'Done!';
    }
  }
}

export namespace ObservableEventMore {
  export class More {
    readonly observable: any;

    constructor(readonly target: ObservableEvent) {
      this.observable = new ObservableMore.More(this.target.target);
    }

    get ['0. inspect']() {
      observableEventInfo(this.target);
      return 'Done!';
    }

    get ['1. inspect preceding events']() {
      eventPrecedingEvents(this.target);
      return 'Done!';
    }

    get ['2. inspect succeeding events']() {
      eventSucceedingEvents(this.target);
      return 'Done!';
    }
  }
}
