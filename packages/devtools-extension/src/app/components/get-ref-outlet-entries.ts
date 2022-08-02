import { PropertyRef, Ref } from '@app/protocols/refs';
import { RefState, RefUiState } from '@app/store/refs';
import { Action } from '@lib/store';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';

export interface RefOutletEntry {
  id: string;
  indent: number;
  path: string;
  ref: Ref;
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string;
  expandable: boolean;
  expanded: boolean;
}

export interface ActionOutletEntry {
  id: string;
  indent: number;
  action: () => Action;
  label: string;
}

type Entry = RefOutletEntry | ActionOutletEntry;

function addActions(
  entries: Entry[],
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
  entries: Entry[],
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
  rootRef: Ref,
  stateKey: string,
  state: RefState,
  uiState: RefUiState,
  type?: 'enumerable' | 'nonenumerable' | 'special',
  label?: string
) {
  const entries: Entry[] = [];

  if (
    getRefOutletEntriesVisitor(
      entries,
      stateKey,
      rootRef,
      0,
      'root',
      state.expandedObjects,
      uiState.expandedPaths,
      type,
      label
    )
  ) {
    return entries;
  } else {
    return undefined;
  }
}
