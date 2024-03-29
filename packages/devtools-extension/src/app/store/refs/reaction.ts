import {
  combineReactions,
  createReaction,
  filterActions,
  Store,
} from '@lib/store';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { concatMap, from, map } from 'rxjs';
import { refsClient } from '@app/clients/refs';
import { refsActions } from '@app/actions/refs-actions';
import { RefsSlice, RefState, RefUiState } from '@app/store/refs/slice';
import { getRefState, getRefUiState } from '@app/selectors/refs-selectors';
import { PropertyRef, Ref } from '@app/protocols/refs';
import { refreshRefsActions } from '@app/actions/refresh-refs-actions';

export const refsReaction = combineReactions()
  .add(
    createReaction(
      (action$, { getState, getUiState }) =>
        action$.pipe(
          filterActions([
            refOutletActions.Expand,
            refreshRefsActions.LoadExpanded,
            refreshRefsActions.Refresh,
          ]),
          concatMap((action) => {
            const { ref, path, stateKey } = action.payload;
            const state = getState(stateKey);
            const uiState = getUiState(stateKey);
            return from(
              loadRefsForExpandedPaths(path, ref, state, uiState)
            ).pipe(
              map((refs) =>
                refsActions.RefsForExpandedPathsLoaded({ stateKey, refs })
              )
            );
          })
        ),
      (store: Store<RefsSlice>) => ({
        getState(stateKey: string) {
          return getRefState(store.get().refs, stateKey);
        },
        getUiState(stateKey: string) {
          return getRefUiState(store.get().refs, stateKey);
        },
      })
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(refOutletActions.InvokeGetter),
        concatMap((action) => {
          const { ref, stateKey, path } = action.payload;
          return from(refsClient.invokeGetter(ref)).pipe(
            map((resolvedRef) =>
              refsActions.RefForInvokedGetterLoaded({
                stateKey,
                objectId: ref.targetObjectId,
                keyId: path.split('.').pop()!,
                ref: resolvedRef!,
              })
            )
          );
        })
      )
    )
  );

function getExpandedPaths(expandedPaths: Set<string>) {
  const prefixes = new Set(['']);
  return new Set(
    Array.from(expandedPaths)
      .map((x) => x.split('.'))
      .sort((a, b) => a.length - b.length)
      .filter((x) => {
        const prefix = x.slice(0, -1).join('.');
        if (prefixes.has(prefix)) {
          prefixes.add(x.join('.'));
          return true;
        } else {
          return false;
        }
      })
      .map((x) => x.join('.'))
  );
}

async function loadRefsForExpandedPathsVisitor(
  expandedObjects: Record<number, PropertyRef[]>,
  expandedPaths: Set<string>,
  path: string,
  ref: Ref
) {
  if (!expandedPaths.has(path)) {
    return;
  }
  if (!('objectId' in ref) || ref.objectId === undefined) {
    return;
  }

  const props = (expandedObjects[ref.objectId] =
    expandedObjects[ref.objectId] ?? (await refsClient.expand(ref)));

  for (const prop of props) {
    const propPath = `${path}.${prop.keyId}`;
    const propRef = prop.val;
    if (prop.val.type === 'getter' && expandedPaths.has(propPath)) {
      prop.val = (await refsClient.invokeGetter(prop.val))!;
    }
    await loadRefsForExpandedPathsVisitor(
      expandedObjects,
      expandedPaths,
      propPath,
      propRef
    );
  }
}

async function loadRefsForExpandedPaths(
  path: string,
  ref: Ref,
  state: RefState,
  uiState: RefUiState
) {
  const expandedPaths = getExpandedPaths(uiState.expandedPaths);
  const expandedObjects: Record<number, PropertyRef[]> = {
    ...state.expandedObjects,
  };

  await loadRefsForExpandedPathsVisitor(
    expandedObjects,
    expandedPaths,
    path,
    ref
  );

  return expandedObjects;
}
