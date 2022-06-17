import { RelatedEvent } from '@app/protocols/insights';

export interface TimelineSlice {
  next: number;
  error: number;
  complete: number;
  subscription: number;
}

function getTimelineSlice(
  slices: Record<number, TimelineSlice>,
  offset: number
) {
  let slice = slices[offset];
  if (slice === undefined) {
    slices[offset] = slice = {
      next: 0,
      error: 0,
      complete: 0,
      subscription: 0,
    };
  }
  return slice;
}

export function getTimestampOffset(
  timestamp: number,
  startTimestamp: number,
  endTimestamp: number,
  width: number
) {
  return Math.floor(
    (width * (timestamp - startTimestamp)) / (endTimestamp - startTimestamp)
  );
}

// offset*2+px =  w *(t-st) /(et-st)
// (offset*2+px)*(et-st)/w + st= (t)
// (offset*2+px)*(et-st)/w + st= (t)

export function getOffsetTimestamp(
  offset: number,
  startTimestamp: number,
  endTimestamp: number,
  width: number
) {
  return (offset * (endTimestamp - startTimestamp)) / width + startTimestamp;
}

export interface Timeline {
  slices: TimelineSlice[];
  startTimestamp: number;
  endTimestamp: number;
}

export function getTimeline(events: RelatedEvent[], width: number): Timeline {
  const startTimestamp = events[0].timestamp;
  const endTimestamp = events.at(-1)!.timestamp;
  const slices: TimelineSlice[] = [];
  for (const event of events) {
    const offset = getTimestampOffset(
      event.timestamp,
      startTimestamp,
      endTimestamp,
      width
    );
    const slice = getTimelineSlice(slices, offset);
    switch (event.eventType) {
      case 'next':
        slice.next++;
        break;
      case 'error':
        slice.error++;
        break;
      case 'complete':
        slice.complete++;
        break;
      case 'subscribe':
      case 'unsubscribe':
        slice.subscription++;
        break;
    }
  }
  return { slices, startTimestamp, endTimestamp };
}
