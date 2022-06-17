import { RelatedEvent, Relations } from '@app/protocols/insights';
import { Timeframe } from '@app/pages/subscriber-page/get-target-timeframes';
import { isExcluded } from '@app/pages/subscriber-page/is-excluded';

export function getIncludedEvents(
  relations: Relations,
  events: RelatedEvent[],
  timeframes: Record<number, Timeframe>
) {
  return events.filter((event) => !isExcluded(relations, event, timeframes));
}
