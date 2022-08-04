import { PropertyRef, Ref } from '@app/protocols/refs';
import { RefsState, RefState, RefUiState } from '@app/store/refs';
import { Action } from '@lib/store';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';
import { getRefState, getRefUiState } from '@app/selectors/refs-selectors';

export interface RefOutletItemEntry {
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

export interface RefOutletActionEntry {
  id: string;
  indent: number;
  action: () => Action;
  label: string;
}

export type RefOutletEntry = RefOutletItemEntry | RefOutletActionEntry;

function addActions(
  entries: RefOutletEntry[],
  indent: number,
  ref: Ref,
  stateKey: string,
  path: string
) {
  switch (ref.type) {
    case 'observable':
    case 'subscriber':
      entries.push({
        id: `${stateKey}:${path}:action:focus`,
        action: () => refOutletContextActions.FocusTarget({ target: ref }),
        indent,
        label: `Focus ${ref.type}`,
      });
      break;
    case 'event': {
      entries.push({
        id: `${stateKey}:${path}:action:focus`,
        action: () => refOutletContextActions.FocusEvent({ event: ref }),
        indent,
        label: `Focus event`,
      });
      break;
    }
  }
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
      addActions(entries, indent + 1, ref, stateKey, path);
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
