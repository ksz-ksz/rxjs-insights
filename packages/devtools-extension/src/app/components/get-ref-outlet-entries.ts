import { PropertyRef, Ref } from '@app/protocols/refs';
import { getRefState, getRefUiState } from '@app/selectors/refs-selectors';
import { RefsState } from '@app/store/refs/store';

export interface RefOutletEntry {
  id: string;
  stateKey: string;
  indent: number;
  path: string;
  ref: Ref;
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string;
  expandable: boolean;
  expanded: boolean;
}

function getRefOutletEntriesVisitor(
  entries: RefOutletEntry[],
  stateKey: string,
  ref: Ref,
  indent: number,
  path: string,
  expandedObjects: Record<number, PropertyRef[]>,
  expandedPaths: Set<string>,
  type?: 'enumerable' | 'nonenumerable' | 'special',
  label?: string
): boolean {
  const expandable = 'objectId' in ref && ref.objectId !== undefined;
  const expanded = expandedPaths.has(path);

  entries.push({
    id: `${stateKey}:${path}`,
    stateKey,
    ref,
    indent,
    label,
    type,
    path,
    expanded,
    expandable,
  });

  const objectId = (ref as { objectId: number }).objectId;
  if (expandable && expanded) {
    if (expandedObjects[objectId] === undefined) {
      return false;
    } else {
      for (const prop of expandedObjects[objectId]) {
        if (
          !getRefOutletEntriesVisitor(
            entries,
            stateKey,
            prop.val,
            indent + 1,
            `${path}.${prop.keyId}`,
            expandedObjects,
            expandedPaths,
            prop.type,
            prop.key
          )
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

export function getRefOutletEntries(
  ref: Ref,
  refs: RefsState,
  stateKey: string,
  type?: 'enumerable' | 'nonenumerable' | 'special',
  label?: string
) {
  const entries: RefOutletEntry[] = [];

  if (
    getRefOutletEntriesVisitor(
      entries,
      stateKey,
      ref,
      0,
      'root',
      getRefState(refs, stateKey).expandedObjects,
      getRefUiState(refs, stateKey).expandedPaths,
      type,
      label
    )
  ) {
    return entries;
  } else {
    return undefined;
  }
}
