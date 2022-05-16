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
import { deref, Observable, Subscriber } from '@rxjs-insights/recorder';
import { Target, Targets, TargetsChannel } from '@app/protocols/targets';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';

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

const targets: Target[] = [];

startServer<Targets>(createInspectedWindowEvalServerAdapter(TargetsChannel), {
  getTargets(): Target[] {
    return targets;
  },
});

const targetsNotificationsClient = createClient<TargetsNotifications>(
  createDocumentEventClientAdapter(TargetsNotificationsChannel)
);

function getTarget(
  target:
    | ObservableLike
    | SubscriberLike
    | (ObservableLike & HasMeta<SubscriberMeta>)
    | (SubscriberLike & HasMeta<SubscriberMeta>)
    | (ObservableLike & HasMeta<ObservableMeta>)
    | (SubscriberLike & HasMeta<ObservableMeta>)
): Target | undefined {
  if (isSubscriberTarget(target)) {
    const subscriber = getSubscriber(target);
    return {
      type: 'subscriber',
      id: subscriber.id,
      name: subscriber.declaration.name,
    };
  }
  if (isObservableTarget(target)) {
    const observable = getObservable(target);
    return {
      type: 'observable',
      id: observable.id,
      name: observable.declaration.name,
    };
  }
  return undefined;
}

function inspect(inspectTarget: ObservableLike | SubscriberLike) {
  const target = getTarget(inspectTarget);
  if (target) {
    targets.push(target);
    targetsNotificationsClient.notifyTarget(target);
  }
}

(window as any).RXJS_ISNIGHTS_DEVTOOLS_INSPECT = inspect;

(window as any)['RXJS_INSIGHTS_INSTALL'] =
  sessionStorage.getItem(RXJS_INSIGHTS_ENABLED_KEY) === 'true';
