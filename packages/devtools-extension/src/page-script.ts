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
  ObservableLike,
  SubscriberLike,
} from '@rxjs-insights/core';
import {
  deref,
  Event,
  Observable,
  ObservableEvent,
  Subscriber,
} from '@rxjs-insights/recorder';
import { Target, Targets, TargetsChannel } from '@app/protocols/targets';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';
import { Insights, InsightsChannel } from '@app/protocols/insights';
import {
  Trace,
  TraceFrame,
  Traces,
  TracesChannel,
} from '@app/protocols/traces';
import { RefsService } from './refs-service';
import { ObservableRef, Refs, RefsChannel } from '@app/protocols/refs';
import {
  getObservable,
  getSubscriber,
  isObservableTarget,
  isSubscriberTarget,
} from '@rxjs-insights/recorder-utils';

const RXJS_INSIGHTS_ENABLED_KEY = 'RXJS_INSIGHTS_ENABLED';

function getTrace(event: Event | undefined): Trace {
  if (event === undefined) {
    return [];
  } else {
    const frame: TraceFrame = {
      task: {
        id: event.task.id,
        name: event.task.name,
      },
      event: {
        id: event.time,
        type: event.declaration.name as any,
        name: event.declaration.name,
      },
      target: {
        id: event.target.id,
        type: event.target.type,
        name: event.target.declaration.name,
        locations: event.target.declaration.locations,
      },
    };
    return [frame, ...getTrace(event.precedingEvent)];
  }
}

startServer<Traces>(createInspectedWindowEvalServerAdapter(TracesChannel), {
  getTrace() {
    const env = getGlobalEnv();
    if (env) {
      const event = deref(env.tracer.getTrace()?.eventRef);
      return getTrace(event);
    } else {
      return undefined;
    }
  },
});

startServer<Statistics>(
  createInspectedWindowEvalServerAdapter(StatisticsChannel),
  {
    getStats() {
      return getGlobalEnv().recorder.getStats();
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

const targets: {
  observables: Record<number, Observable>;
  subscribers: Record<number, Subscriber>;
} = {
  observables: {},
  subscribers: {},
};

startServer<Targets>(createInspectedWindowEvalServerAdapter(TargetsChannel), {
  releaseTarget(target: Target) {
    switch (target.type) {
      case 'subscriber':
        delete targets.subscribers[target.id];
        return;
      case 'observable':
        delete targets.observables[target.id];
        return;
    }
  },
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

const refs = new RefsService();

(window as any).REFS = refs;

startServer<Refs>(createInspectedWindowEvalServerAdapter(RefsChannel), refs);

startServer<Insights>(createInspectedWindowEvalServerAdapter(InsightsChannel), {
  getObservableRef(observableId: number): ObservableRef | undefined {
    const observable = targets.observables[observableId];
    if (!observable) {
      return undefined;
    } else {
      return refs.create(observable.target) as ObservableRef;
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
