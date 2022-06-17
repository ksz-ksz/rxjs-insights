import { Relations } from '@app/protocols/insights';

export function getEvents(relations: Relations) {
  return Object.values(relations.events).sort((a, b) => a.time - b.time);
}
