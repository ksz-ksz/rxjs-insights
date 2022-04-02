import { Location, Locations } from '@rxjs-insights/instrumentation';
import { Event, Observable, Subscriber, Task } from '@rxjs-insights/recorder';
import { Color, getEventColor } from './colors';

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

export function getLocationString(location: Location) {
  return `${location.file}:${location.line}:${location.column}`;
}

export function getLocationsString(locations: Locations) {
  if (locations.originalLocation) {
    return getLocationString(locations.originalLocation);
  } else if (locations.generatedLocation) {
    return getLocationString(locations.generatedLocation);
  } else {
    return '';
  }
}

export function observableTag(observable: Observable, target = false) {
  const color = target
    ? Color.Target.Observable.Primary
    : Color.Target.Observable.Secondary;
  return {
    format: `%c${observable.declaration.name} #${observable.id}%c`,
    args: [
      `font-weight: bold; color: black; background-color: ${color}; padding: 2px 4px; border-radius: 4px;`,
      ``,
    ],
  };
}

export function subscriberTag(subscriber: Subscriber, target = false) {
  const color = target
    ? Color.Target.Subscription.Primary
    : Color.Target.Subscription.Secondary;
  return {
    format: `%c${subscriber.declaration.name} #${subscriber.id}%c`,
    args: [
      `font-weight: bold; color: black; background-color: ${color}; padding: 2px 4px; border-radius: 4px;`,
      ``,
    ],
  };
}

export function targetTag(target: Observable | Subscriber, isTarget = false) {
  if (target instanceof Observable) {
    return observableTag(target, isTarget);
  } else {
    return subscriberTag(target, isTarget);
  }
}

export function eventTag(event: Event, target = false) {
  const color = getEventColor(event.declaration.name, target);

  return {
    format: `%c${event.declaration.name} #${event.time}%c`,
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
  return tags(...event.declaration.args.map((x) => objectTag(x)));
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
    format: expand || isPrimitive(object) ? '%o' : '%O',
    args: [object],
  };
}

export function labelTag(label: string | undefined) {
  if (label) {
    return {
      format: `%c${label}%c`,
      args: [
        `font-weight: bold; font-size: 0.6rem; color: black; background-color: #f3e5f5; padding: 1px 2px; border-radius: 4px;`,
        '',
      ],
    };
  } else {
    return emptyTag;
  }
}

export function textTag(text: string, style: string = '') {
  if (text) {
    return {
      format: `%c${text}%c`,
      args: [style, ''],
    };
  } else {
    return emptyTag;
  }
}
