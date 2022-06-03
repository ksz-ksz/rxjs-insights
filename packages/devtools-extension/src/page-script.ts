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
import { deref, Event, Observable, Subscriber } from '@rxjs-insights/recorder';
import { Target, Targets, TargetsChannel } from '@app/protocols/targets';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';
import {
  Insights,
  InsightsChannel,
  RelatedEvent,
  RelatedObservable,
  RelatedSubscriber,
  Relations,
} from '@app/protocols/insights';
import {
  Trace,
  TraceFrame,
  Traces,
  TracesChannel,
} from '@app/protocols/traces';
import { RefsService } from './refs-service';
import {
  ObservableRef,
  Refs,
  RefsChannel,
  SubscriberRef,
} from '@app/protocols/refs';
import {
  getDestinationEvents,
  getObservable,
  getSourceEvents,
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

const refs = new RefsService();

(window as any).REFS = refs;

startServer<Refs>(createInspectedWindowEvalServerAdapter(RefsChannel), refs);

function getRelatedEvent(event: Event, excluded: boolean): RelatedEvent {
  return {
    time: event.time,
    name: event.declaration.name,
    type: event.type,
    target: {
      id: event.target.id,
      type: event.target.type,
    },
    excluded,
    precedingEvent: event.precedingEvent?.time,
    succeedingEvents: event.succeedingEvents.map(({ time }) => time),
  };
}

function getRelatedObservable(observable: Observable): RelatedObservable {
  return {
    id: observable.id,
    name: observable.declaration.name,
    tags: observable.tags,
  };
}

function getRelatedSubscriber(subscriber: Subscriber): RelatedSubscriber {
  return {
    id: subscriber.id,
    observable: subscriber.observable.id,
  };
}

function addEvent(relations: Relations, event: Event, excluded = false) {
  relations.events[event.time] = getRelatedEvent(event, excluded);
  if (
    event.target.type === 'observable' &&
    relations.observables[event.target.id] === undefined
  ) {
    relations.observables[event.target.id] = getRelatedObservable(event.target);
  }
  if (
    event.target.type === 'subscriber' &&
    relations.subscribers[event.target.id] === undefined
  ) {
    relations.subscribers[event.target.id] = getRelatedSubscriber(event.target);
    if (relations.observables[event.target.observable.id] === undefined) {
      relations.observables[event.target.observable.id] = getRelatedObservable(
        event.target.observable
      );
    }
  }
}

function collectEvents(
  event: Event,
  relations: Relations,
  expandIncludedEvents: (event: Event) => Event[],
  expandExcludedEvents: (event: Event) => Event[],
  root = false
) {
  if (relations.events[event.time] === undefined) {
    addEvent(relations, event);
    if (!root) {
      for (const excludedEvent of expandExcludedEvents(event)) {
        if (relations.events[excludedEvent.time] === undefined) {
          addEvent(relations, excludedEvent, true);
        }
      }
    }
    for (const includedEvent of expandIncludedEvents(event)) {
      collectEvents(
        includedEvent,
        relations,
        expandIncludedEvents,
        expandExcludedEvents
      );
    }
  }
}

function getRelations(events: Event[]) {
  const relations: Relations = {
    observables: {},
    subscribers: {},
    events: {},
  };
  for (const event of events) {
    collectEvents(
      event,
      relations,
      getSourceEvents,
      getDestinationEvents,
      true
    );
    collectEvents(
      event,
      relations,
      getDestinationEvents,
      getSourceEvents,
      true
    );
  }

  return relations;
}

startServer<Insights>(createInspectedWindowEvalServerAdapter(InsightsChannel), {
  getObservableRef(observableId: number): ObservableRef | undefined {
    const observable = targets.observables[observableId];
    if (!observable) {
      return undefined;
    } else {
      return refs.create(observable) as ObservableRef;
    }
  },
  getObservableRelations(observableId: number): Relations | undefined {
    const observable = targets.observables[observableId];
    if (!observable) {
      return undefined;
    } else {
      return getRelations(observable.events);
    }
  },
  getSubscriberRef(subscriberId: number): SubscriberRef | undefined {
    const subscriber = targets.subscribers[subscriberId];
    if (!subscriber) {
      return undefined;
    } else {
      return refs.create(subscriber) as SubscriberRef;
    }
  },
  getSubscriberRelations(subscriberId: number): Relations | undefined {
    const subscriber = targets.subscribers[subscriberId];
    if (!subscriber) {
      return undefined;
    } else {
      return getRelations(subscriber.events);
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
