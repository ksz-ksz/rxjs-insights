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
  Subscriber,
  Task,
} from '@rxjs-insights/recorder';
import { Target, Targets, TargetsChannel } from '@app/protocols/targets';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';
import {
  Insights,
  InsightsChannel,
  ObservableState,
  Relations,
  SubscriberState,
} from '@app/protocols/insights';
import {
  Trace,
  TraceFrame,
  Traces,
  TracesChannel,
} from '@app/protocols/traces';
import { RefsService } from './refs-service';
import { EventRef, Refs, RefsChannel } from '@app/protocols/refs';
import {
  getDestinationEvents,
  getObservable,
  getPrecedingEvent,
  getSourceEvents,
  getSubscriber,
  getSucceedingEvents,
  isObservableTarget,
  isSubscriberTarget,
} from '@rxjs-insights/recorder-utils';
import {
  OUT_OF_BOUNDS_MAX_TIME,
  OUT_OF_BOUNDS_MIN_TIME,
} from '@app/constants/timeframe';

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

const targets: Record<number, Observable | Subscriber> = {};

startServer<Targets>(createInspectedWindowEvalServerAdapter(TargetsChannel), {
  releaseTarget(target: Target) {
    delete targets[target.id];
  },
  getTargets(): Target[] {
    return Object.values(targets).map(
      ({ id, type, declaration: { name } }): Target => ({
        type,
        id,
        name,
      })
    );
  },
});

const targetsNotificationsClient = createClient<TargetsNotifications>(
  createDocumentEventClientAdapter(TargetsNotificationsChannel)
);

const refs = new RefsService();

(window as any).REFS = refs;

startServer<Refs>(createInspectedWindowEvalServerAdapter(RefsChannel), refs);

function getStartTime(events: Event[]) {
  if (events.length === 0) {
    return OUT_OF_BOUNDS_MAX_TIME;
  } else {
    return events[0].time;
  }
}

function getEndTime(events: Event[]) {
  if (events.length === 0) {
    return OUT_OF_BOUNDS_MIN_TIME;
  } else {
    const lastEvent = events.at(-1)!;
    switch (lastEvent.type) {
      case 'error':
      case 'complete':
      case 'unsubscribe':
        return lastEvent.time;
      default:
        return OUT_OF_BOUNDS_MAX_TIME;
    }
  }
}

function addRelatedTarget(
  relations: Relations,
  target: Subscriber | Observable,
  relation: 'sources' | 'destinations',
  relatedTargets: Set<Subscriber | Observable>
) {
  const targets = relations.targets;
  if (targets[target.id] === undefined) {
    targets[target.id] = {
      id: target.id,
      name: target.declaration.name,
      type: target.type,
      tags: target.tags,
      startTime:
        target.type === 'subscriber'
          ? getStartTime(target.events)
          : OUT_OF_BOUNDS_MIN_TIME,
      endTime:
        target.type === 'subscriber'
          ? getEndTime(target.events)
          : OUT_OF_BOUNDS_MAX_TIME,
      locations: target.declaration.locations,
      [relation]: Array.from(relatedTargets).map(({ id }) => id),
    };
  } else if (targets[target.id][relation] === undefined) {
    targets[target.id][relation] = Array.from(relatedTargets).map(
      ({ id }) => id
    );
  }
}

function addRelatedTask(relations: Relations, task: Task) {
  const tasks = relations.tasks;
  if (tasks[task.id] === undefined) {
    tasks[task.id] = {
      id: task.id,
      name: task.name,
    };
  }
}

function addRelatedEvent(relations: Relations, event: Event) {
  const events = relations.events;
  if (events[event.time] === undefined) {
    const precedingEvent = getPrecedingEvent(event);
    const succeedingEvents = getSucceedingEvents(event);
    events[event.time] = {
      ...(refs.create(event) as EventRef),
      timestamp: event.timestamp,
      target: event.target.id,
      task: event.task.id,
      precedingEvent: precedingEvent?.time,
      succeedingEvents: succeedingEvents.map(({ time }) => time),
    };
    if (precedingEvent) {
      addRelatedEvent(relations, precedingEvent);
    }
    for (const succeedingEvent of succeedingEvents) {
      addRelatedEvent(relations, succeedingEvent);
    }
    addRelatedTask(relations, event.task);
  }
}

function collectRelatedTargets(
  targets: Set<number>,
  relations: Relations,
  target: Subscriber | Observable,
  relation: 'sources' | 'destinations',
  getRelatedEvents: (event: Event) => Event[]
) {
  if (targets.has(target.id)) {
    return;
  }
  targets.add(target.id);
  const relatedEvents = target.events.flatMap(getRelatedEvents);
  const relatedTargets = new Set(relatedEvents.map(({ target }) => target));
  relatedTargets.delete(target);
  addRelatedTarget(relations, target, relation, relatedTargets);
  for (const event of target.events) {
    addRelatedEvent(relations, event);
  }
  for (let relatedTarget of relatedTargets) {
    collectRelatedTargets(
      targets,
      relations,
      relatedTarget,
      relation,
      getRelatedEvents
    );
  }
}

function getTargetState(target: Subscriber | Observable) {
  const ref = refs.create(target);
  const relations: Relations = {
    targets: {},
    events: {},
    tasks: {},
  };
  collectRelatedTargets(
    new Set(),
    relations,
    target,
    'sources',
    getSourceEvents
  );
  collectRelatedTargets(
    new Set(),
    relations,
    target,
    'destinations',
    getDestinationEvents
  );

  return { ref, relations };
}

startServer<Insights>(createInspectedWindowEvalServerAdapter(InsightsChannel), {
  getObservableState(observableId: number): ObservableState | undefined {
    const observable = targets[observableId];
    if (!observable) {
      return undefined;
    } else {
      return getTargetState(observable) as ObservableState;
    }
  },
  getSubscriberState(subscriberId: number): SubscriberState | undefined {
    const subscriber = targets[subscriberId];
    if (!subscriber) {
      return undefined;
    } else {
      return getTargetState(subscriber) as SubscriberState;
    }
  },
});

function inspect(target: ObservableLike | SubscriberLike) {
  if (isSubscriberTarget(target)) {
    const subscriber = getSubscriber(target);
    targets[subscriber.id] = subscriber;
    targetsNotificationsClient.notifyTarget({
      type: 'subscriber',
      id: subscriber.id,
      name: subscriber.declaration.name,
    });
  }
  if (isObservableTarget(target)) {
    const observable = getObservable(target);
    targets[observable.id] = observable;
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
