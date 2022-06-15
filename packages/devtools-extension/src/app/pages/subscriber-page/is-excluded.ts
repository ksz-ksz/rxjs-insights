import {
  RelatedEvent,
  RelatedTarget,
  Relations,
} from '@app/protocols/insights';

export function isExcluded(
  relations: Relations,
  event: RelatedEvent,
  rootTarget: RelatedTarget,
  expandedIds: Set<number>
) {
  return (
    !expandedIds.has(event.target) ||
    relations.targets[event.target] === undefined ||
    event.time < rootTarget.startTime ||
    event.time > rootTarget.endTime
  );
}
