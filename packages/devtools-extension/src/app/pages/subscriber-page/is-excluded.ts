import {
  RelatedEvent,
  RelatedTarget,
  Relations,
} from '@app/protocols/insights';

export function isExcluded(
  relations: Relations,
  event: RelatedEvent,
  rootTarget: RelatedTarget
) {
  return (
    relations.targets[event.target] === undefined ||
    event.time < rootTarget.startTime ||
    event.time > rootTarget.endTime
  );
}
