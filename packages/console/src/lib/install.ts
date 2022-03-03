import { succeedingEvents } from './succeeding-events';
import { destinations } from './destinations';
import { events } from './events';
import { flow } from './flow';
import { subscribers } from './subscribers';
import { precedingEvents } from './preceding-events';
import { sources } from './sources';

export function install(name = '$insights') {
  (globalThis as any)[name] = {
    subscribers,
    sources,
    destinations,
    precedingEvents,
    succeedingEvents,
    events,
    flow,
  };
}
