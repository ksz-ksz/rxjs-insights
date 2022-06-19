import { RelatedEvent, Relations } from '@app/protocols/insights';
import { Timeframe } from './get-target-timeframes';

export function isExcluded(
  relations: Relations,
  event: RelatedEvent,
  timeframes: Record<number, Timeframe>
) {
  const targetTimeframe = timeframes[event.target];
  return (
    targetTimeframe === undefined ||
    event.time < targetTimeframe.startTime ||
    event.time > targetTimeframe.endTime
  );
}
