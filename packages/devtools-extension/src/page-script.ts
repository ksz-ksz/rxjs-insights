import {
  createClient,
  createDocumentEventClientAdapter,
  createInspectedWindowEvalServerAdapter,
  startServer,
} from '@lib/rpc';
import {
  Instrumentation,
  InstrumentationChannel,
} from '@app/protocols/instrumentation-status';
import { Statistics, StatisticsChannel } from '@app/protocols/statistics';
import {
  getGlobalEnv,
  getMeta,
  hasMeta,
  HasMeta,
  ObservableLike,
  ObservableMeta,
  SubscriberLike,
  SubscriberMeta,
} from '@rxjs-insights/core';
import {
  deref,
  Observable,
  ObservableEvent,
  Subscriber,
} from '@rxjs-insights/recorder';
import { Target, Targets, TargetsChannel } from '@app/protocols/targets';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';
import { Data, DataChannel, ObservableInfo } from '@app/protocols/data';

const RXJS_INSIGHTS_ENABLED_KEY = 'RXJS_INSIGHTS_ENABLED';

startServer<Statistics>(
  createInspectedWindowEvalServerAdapter(StatisticsChannel),
  {
    getStats() {
      return getGlobalEnv().getRecorderStats();
    },
  }
);

startServer<Instrumentation>(
  createInspectedWindowEvalServerAdapter(InstrumentationChannel),
  {
    getStatus() {
      switch ((window as any).RXJS_INSIGHTS_INSTALLED) {
        case true:
          return 'installed';
        case false:
          return 'not-installed';
        default:
          return 'not-available';
      }
    },

    install() {
      sessionStorage.setItem(RXJS_INSIGHTS_ENABLED_KEY, 'true');
      location.reload();
    },
  }
);

export function isSubscriberTarget(
  target: any
): target is HasMeta<SubscriberMeta> {
  if (hasMeta(target)) {
    const meta = getMeta<SubscriberMeta>(target);
    return 'subscriberRef' in meta;
  } else {
    return false;
  }
}

export function isObservableTarget(
  target: any
): target is HasMeta<ObservableMeta> {
  if (hasMeta(target)) {
    const meta = getMeta<ObservableMeta>(target);
    return 'observableRef' in meta;
  } else {
    return false;
  }
}

export function getSubscriber(target: HasMeta<SubscriberMeta>): Subscriber {
  return deref(getMeta(target).subscriberRef);
}

export function getObservable(target: HasMeta<ObservableMeta>): Observable {
  return deref(getMeta(target).observableRef);
}

const targets: {
  observables: Record<number, Observable>;
  subscribers: Record<number, Subscriber>;
} = {
  observables: {},
  subscribers: {},
};

startServer<Targets>(createInspectedWindowEvalServerAdapter(TargetsChannel), {
  getTargets(): Target[] {
    return [
      ...Object.values(targets.observables).map(
        ({ id, declaration: { name } }): Target => ({
          type: 'observable',
          id,
          name,
        })
      ),
      ...Object.values(targets.subscribers).map(
        ({ id, declaration: { name } }): Target => ({
          type: 'subscriber',
          id,
          name,
        })
      ),
    ];
  },
});

const targetsNotificationsClient = createClient<TargetsNotifications>(
  createDocumentEventClientAdapter(TargetsNotificationsChannel)
);

type Status = 'error' | 'complete' | 'unsubscribe' | 'next';

function getStatus(subscriber: Subscriber) {
  return (subscriber.events.find(
    (x) =>
      x.declaration.name === 'error' ||
      x.declaration.name === 'complete' ||
      x.declaration.name === 'unsubscribe'
  )?.declaration.name ?? 'next') as Status;
}

function countEvents(
  events: ObservableEvent[],
  eventType: 'next' | 'error' | 'complete'
) {
  return events.filter((x) => x.declaration.name === eventType).length;
}

function countStatuses(statuses: Status[], statusType: string) {
  return statuses.filter((x) => x === statusType).length;
}

startServer<Data>(createInspectedWindowEvalServerAdapter(DataChannel), {
  getObservableInfo(observableId: number): ObservableInfo | undefined {
    const observable = targets.observables[observableId];
    if (!observable) {
      return undefined;
    } else {
      const subscriberStatuses = observable.subscribers.map(getStatus);
      return {
        id: observable.id,
        name: observable.declaration.name,
        target: undefined as any,
        internal: observable.declaration.internal,
        tags: observable.tags,
        notifications: {
          next: countEvents(observable.events, 'next'),
          error: countEvents(observable.events, 'error'),
          complete: countEvents(observable.events, 'complete'),
        },
        subscriptions: {
          active: countStatuses(subscriberStatuses, 'next'),
          errored: countStatuses(subscriberStatuses, 'error'),
          completed: countStatuses(subscriberStatuses, 'complete'),
          unsubscribed: countStatuses(subscriberStatuses, 'unsubscribe'),
        },
        ctor: undefined,
        args: undefined,
        source: undefined,
      };
    }
  },
});

function inspect(target: ObservableLike | SubscriberLike) {
  if (isSubscriberTarget(target)) {
    const subscriber = getSubscriber(target);
    targets.subscribers[subscriber.id] = subscriber;
    targetsNotificationsClient.notifyTarget({
      type: 'subscriber',
      id: subscriber.id,
      name: subscriber.declaration.name,
    });
  }
  if (isObservableTarget(target)) {
    const observable = getObservable(target);
    targets.observables[observable.id] = observable;
    targetsNotificationsClient.notifyTarget({
      type: 'observable',
      id: observable.id,
      name: observable.declaration.name,
    });
  }
}

(window as any).RXJS_ISNIGHTS_DEVTOOLS_INSPECT = inspect;

(window as any)['RXJS_INSIGHTS_INSTALL'] =
  sessionStorage.getItem(RXJS_INSIGHTS_ENABLED_KEY) === 'true';
