import { succeedingEvents } from './succeeding-events';
import { destinations } from './destinations';
import { events } from './events';
import { flow } from './flow';
import { instances } from './instances';
import { precedingEvents } from './preceding-events';
import { sources } from './sources';

export function install(name = '$insights') {
  (globalThis as any)[name] = {
    succeedingEvents,
    destinations,
    events,
    flow,
    instances,
    precedingEvents,
    sources,
  };
}
