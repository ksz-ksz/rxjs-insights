import { Location, Locations } from '@rxjs-insights/instrumentation';
import { Observable, Task, Event, Subscriber } from '@rxjs-insights/recorder';

export interface Tag {
  format: string;
  args: any[];
}

export type TagLike = Tag | string | number | boolean | undefined | null;
export const emptyTag = { format: '', args: [] };

export function tag(input: TagLike): Tag {
  if (!input) {
    return emptyTag;
  }
  if (typeof input === 'object') {
    return input;
  }
  return {
    format: String(input),
    args: [],
  };
}

export function tags(...input: TagLike[]): Tag {
  const tags = input.map(tag).filter((tag) => tag.format !== '');
  return {
    format: tags.map((tag) => tag.format).join(' '),
    args: tags.flatMap((tag) => tag.args),
  };
}

function getLocationString(location: Location) {
  return `${location.file}:${location.line}:${location.column}`;
}

export function getLocationsString(locations: Locations) {
  if (locations.originalLocation) {
    return `${getLocationString(locations.originalLocation)}`;
  } else if (locations.generatedLocation) {
    return `${getLocationString(locations.generatedLocation)}`;
  } else {
    return '';
  }
}

export function observableTag(observable: Observable, target = false) {
  const color = target ? '#42a5f5' : '#90caf9';
  return {
    format: `%c${observable.declaration.name} #${observable.id}%c`,
    args: [
      `font-weight: bold; color: black; background-color: ${color}; padding: 2px 4px; border-radius: 4px;`,
      ``,
    ],
  };
}

export function subscriberTag(subscriber: Subscriber, target = false) {
  const color = target ? '#ab47bc' : '#ce93d8';
  return {
    format: `%c${subscriber.name} #${subscriber.id}%c`,
    args: [
      `font-weight: bold; color: black; background-color: ${color}; padding: 2px 4px; border-radius: 4px;`,
      ``,
    ],
  };
}

export function eventTag(event: Event, target = false) {
  let color: string;
  if (event.name === 'next') {
    color = target ? '#388e3c' : '#66bb6a';
  } else if (event.name === 'error') {
    color = target ? '#d32f2f' : '#f44336';
  } else if (event.name === 'complete') {
    color = target ? '#0288d1' : '#29b6f6';
  } else {
    color = target ? '#f57c00' : '#ffa726';
  }

  return {
    format: `%c${event.name} #${event.time}%c`,
    args: [
      `font-weight: bold; color: black; background-color: ${color}; padding: 2px 4px; border-radius: 4px;`,
      ``,
    ],
  };
}

export function taskTag(task: Task) {
  return {
    format: `%c${task.name} #${task.id}%c`,
    args: [
      `font-weight: bold; color: black; background-color: #e3f2fd; padding: 2px 4px; border-radius: 4px;`,
      ``,
    ],
  };
}

export function dataTag(event: Event) {
  return tags(...event.args.map((x) => objectTag(x)));
}

function isPrimitive(object: any) {
  if (object === null) {
    return true;
  } else {
    switch (typeof object) {
      case 'object':
      case 'function':
        return false;
      default:
        return true;
    }
  }
}

export function objectTag(object: any, expand = false) {
  return {
    format: isPrimitive(object) ? '%o' : '%O',
    args: [object],
  };
}

export function labelTag(label: string | undefined) {
  if (label) {
    return {
      format: `%c${label}%c`,
      args: [
        `font-weight: bold; font-size: 0.6rem; color: black; background-color: #f3e5f5; padding: 1px 2px; border-radius: 4px;`,
        ``,
      ],
    };
  } else {
    return emptyTag;
  }
}
