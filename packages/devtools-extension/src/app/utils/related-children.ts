import { RelatedTarget } from '@app/protocols/insights';

export function getSourceChildren(target: RelatedTarget) {
  return target.sources ?? [];
}

export function getSourceChildKey(childId: number, parentKey: string) {
  return `${childId}.${parentKey}`;
}

export function getDestinationChildren(target: RelatedTarget) {
  return target.destinations ?? [];
}

export function getDestinationChildKey(childId: number, parentKey: string) {
  return `${parentKey}.${childId}`;
}
