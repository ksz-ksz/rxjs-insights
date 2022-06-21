import { Target } from '@rxjs-insights/recorder';
import {
  getDestinationNotifications,
  getSourceNotifications,
} from './event-utils';

export function getDestinationTargets(target: Target): Target[] {
  return target.destinations.flatMap((t) =>
    t.declaration.internal ? getDestinationTargets(t) : [t]
  );
}

export function getSourceTargets(target: Target): Target[] {
  return target.sources.flatMap((t) =>
    t.declaration.internal ? getSourceTargets(t) : [t]
  );
}

export function getRelatedDestinationTargets(target: Target): Target[] {
  const relatedEvents = target.events.flatMap(getDestinationNotifications);
  const relatedTargets = new Set([
    ...relatedEvents.map(({ target }) => target),
    ...getDestinationTargets(target),
  ]);
  relatedTargets.delete(target);
  return Array.from(relatedTargets);
}

export function getRelatedSourceTargets(target: Target): Target[] {
  const relatedEvents = target.events.flatMap(getSourceNotifications);
  const relatedTargets = new Set([
    ...relatedEvents.map(({ target }) => target),
    ...getSourceTargets(target),
  ]);
  relatedTargets.delete(target);
  return Array.from(relatedTargets);
}
