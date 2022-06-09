export function partition<T>(
  events: T[],
  partitionFn: (a: T, b: T) => boolean
) {
  const parts: T[][] = [];
  let part: T[] = [];
  let currentEvent: T | undefined = undefined;
  for (let event of events) {
    if (currentEvent !== undefined && partitionFn(event, currentEvent)) {
      parts.push(part);
      part = [];
    }
    currentEvent = event;
    part.push(event);
  }
  parts.push(part);
  return parts;
}
