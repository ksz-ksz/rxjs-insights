import {
  Insights,
  RelatedTarget,
  Relations,
  TargetState,
} from '@app/protocols/insights';
import { Event, Target, Task } from '@rxjs-insights/recorder';
import {
  getPrecedingEvent,
  getRelatedDestinationTargets,
  getRelatedSourceTargets,
  getSucceedingEvents,
} from '@rxjs-insights/recorder-utils';
import { EventRef, TargetRef } from '@app/protocols/refs';
import {
  OUT_OF_BOUNDS_MAX_TIME,
  OUT_OF_BOUNDS_MIN_TIME,
} from '@app/constants/timeframe';
import { RefsService } from './refs-service';

export class InsightsService implements Insights {
  constructor(private readonly refs: RefsService) {}

  getTargetState(targetId: number): TargetState | undefined {
    const target = this.refs.getTarget(targetId);
    if (!target) {
      return undefined;
    } else {
      return this.getTargetStateImpl(target);
    }
  }

  private getStartTime(events: Event[]) {
    if (events.length === 0) {
      return OUT_OF_BOUNDS_MAX_TIME;
    } else {
      return events[0].time;
    }
  }

  private getEndTime(events: Event[]) {
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

  private addRelatedTarget(
    relations: Relations,
    target: Target,
    relation: 'sources' | 'destinations',
    relatedTargets: Target[]
  ) {
    const targets = relations.targets;
    if (targets[target.id] === undefined) {
      targets[target.id] = {
        ...(this.refs.create(target) as TargetRef),
        startTime:
          target.type === 'subscriber'
            ? this.getStartTime(target.events)
            : OUT_OF_BOUNDS_MIN_TIME,
        endTime:
          target.type === 'subscriber'
            ? this.getEndTime(target.events)
            : OUT_OF_BOUNDS_MAX_TIME,
        [relation]: relatedTargets.map(({ id }) => id),
      };
    } else if (targets[target.id][relation] === undefined) {
      targets[target.id][relation] = relatedTargets.map(({ id }) => id);
    }
  }

  private addRelatedTask(relations: Relations, task: Task) {
    const tasks = relations.tasks;
    if (tasks[task.id] === undefined) {
      tasks[task.id] = {
        id: task.id,
        name: task.name,
      };
    }
  }

  private addRelatedEvent(relations: Relations, event: Event) {
    const events = relations.events;
    if (events[event.time] === undefined) {
      const precedingEvent = getPrecedingEvent(event);
      const succeedingEvents = getSucceedingEvents(event);
      events[event.time] = {
        ...(this.refs.create(event) as EventRef),
        timestamp: event.timestamp,
        target: event.target.id,
        task: event.task.id,
        precedingEvent: precedingEvent?.time,
        succeedingEvents: succeedingEvents.map(({ time }) => time),
      };
      if (precedingEvent) {
        this.addRelatedEvent(relations, precedingEvent);
      }
      for (const succeedingEvent of succeedingEvents) {
        this.addRelatedEvent(relations, succeedingEvent);
      }
      this.addRelatedTask(relations, event.task);
    }
  }

  private collectRelatedTargets(
    targets: Set<number>,
    relations: Relations,
    target: Target,
    relation: 'sources' | 'destinations',
    getRelatedTargets: (target: Target) => Target[]
  ) {
    if (targets.has(target.id)) {
      return;
    }
    targets.add(target.id);
    const relatedTargets = getRelatedTargets(target);
    this.addRelatedTarget(relations, target, relation, relatedTargets);
    for (const event of target.events) {
      this.addRelatedEvent(relations, event);
    }
    for (let relatedTarget of relatedTargets) {
      this.collectRelatedTargets(
        targets,
        relations,
        relatedTarget,
        relation,
        getRelatedTargets
      );
    }
  }

  private getTargetStateImpl(target: Target): TargetState {
    const rootTarget: RelatedTarget = {
      ...(this.refs.create(target) as TargetRef),
      startTime:
        target.type === 'subscriber'
          ? this.getStartTime(target.events)
          : OUT_OF_BOUNDS_MIN_TIME,
      endTime:
        target.type === 'subscriber'
          ? this.getEndTime(target.events)
          : OUT_OF_BOUNDS_MAX_TIME,
      locations: target.declaration.locations,
    };
    const relations: Relations = {
      targets: {},
      events: {},
      tasks: {},
    };
    relations.targets[rootTarget.id] = rootTarget;
    this.collectRelatedTargets(
      new Set(),
      relations,
      target,
      'sources',
      getRelatedSourceTargets
    );

    this.collectRelatedTargets(
      new Set(),
      relations,
      target,
      'destinations',
      getRelatedDestinationTargets
    );

    return { target: rootTarget, relations };
  }
}
