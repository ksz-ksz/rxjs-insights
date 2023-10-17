import { insightsActions } from '@app/actions/insights-actions';
import { RelatedTarget, Relations, TargetState } from '@app/protocols/insights';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';
import { rebaseKeys } from '@app/store/insights/rebase-keys';
import { inspectedWindowActions } from '@app/actions/inspected-window-actions';
import {
  getDestinationChildKey,
  getDestinationChildren,
  getSourceChildKey,
  getSourceChildren,
} from '@app/utils/related-children';
import { getTargetIdFromKey } from '@app/pages/target-page/get-root-target-id';
import { createStore, tx } from '@lib/state-fx/store';

let nextKeyId = 0;

export interface TargetUiState {
  expandedKeys: Set<string>;
  keysMapping: Record<string, number>;
}

export interface InsightsState {
  playing: boolean;
  following: boolean;
  showExcludedEvents: boolean;
  targetsUi: Record<number, TargetUiState>;
  targets: Record<number, TargetState>;
}

function expandVisitor(
  visitedTargets: Set<number>,
  relations: Relations,
  getChildren: (target: RelatedTarget) => number[],
  getChildKey: (childId: number, parentKey: string) => string,
  expandedKeys: Set<string>,
  key: string
) {
  const targetId = getTargetIdFromKey(key);
  if (visitedTargets.has(targetId)) {
    return;
  }
  expandedKeys.add(key);
  const target = relations.targets[targetId];
  const relatedTargets = getChildren(target);
  if (relatedTargets.length !== 0) {
    visitedTargets.add(targetId);
    for (const relatedTarget of relatedTargets) {
      expandVisitor(
        visitedTargets,
        relations,
        getChildren,
        getChildKey,
        expandedKeys,
        getChildKey(relatedTarget, key)
      );
    }
    visitedTargets.delete(targetId);
  }
}

function getKeysMappingVisitor(
  expandedKeys: Set<string>,
  keyMapping: Record<string, number>,
  existingKeyMapping: Record<string, number>,
  target: RelatedTarget,
  targetKey: string,
  relations: Relations,
  getChildren: (target: RelatedTarget) => number[],
  getChildKey: (childId: number, parentKey: string) => string
) {
  keyMapping[targetKey] = existingKeyMapping[targetKey] ?? nextKeyId++;
  if (expandedKeys.has(targetKey)) {
    for (const childTargetId of getChildren(target)) {
      const childTarget = relations.targets[childTargetId];
      const childTargetKey = getChildKey(childTargetId, targetKey);
      getKeysMappingVisitor(
        expandedKeys,
        keyMapping,
        existingKeyMapping,
        childTarget,
        childTargetKey,
        relations,
        getChildren,
        getChildKey
      );
    }
  }
}

function getKeysMapping(
  { target, relations }: TargetState,
  expandedKeys: Set<string>,
  existingKeyMapping: Record<string, number> = {}
) {
  const keyMapping: Record<string, number> = {};
  getKeysMappingVisitor(
    expandedKeys,
    keyMapping,
    existingKeyMapping,
    target,
    `<${target.id}>`,
    relations,
    getSourceChildren,
    getSourceChildKey
  );
  getKeysMappingVisitor(
    expandedKeys,
    keyMapping,
    existingKeyMapping,
    target,
    `<${target.id}>`,
    relations,
    getDestinationChildren,
    getDestinationChildKey
  );
  return keyMapping;
}

function updateKeyMapping(state: InsightsState, targetId: number) {
  const targetState = state.targets[targetId];
  const targetUi = state.targetsUi[targetId];
  targetUi.keysMapping = getKeysMapping(
    targetState,
    targetUi.expandedKeys,
    targetUi.keysMapping
  );
}

const initialState: InsightsState = {
  playing: false,
  following: false,
  showExcludedEvents: false,
  targetsUi: {},
  targets: {},
};
export const insightsStore = createStore({
  namespace: 'insights',
  state: initialState,
})({
  resetState: tx(
    [inspectedWindowActions.InspectedWindowReloaded],
    () => initialState
  ),
  targetStateLoaded: tx(
    [insightsActions.TargetStateLoaded],
    (state, action) => {
      const { state: targetState } = action.payload;
      if (targetState !== undefined) {
        state.targets[targetState.target.id] = targetState;
        if (!state.targetsUi[targetState.target.id]) {
          const expandedKeys = new Set([`<${targetState.target.id}>`]);
          state.targetsUi[targetState.target.id] = {
            expandedKeys: expandedKeys,
            keysMapping: getKeysMapping(targetState, expandedKeys),
          };
        } else {
          updateKeyMapping(state, targetState.target.id);
        }
      }
    }
  ),
  play: tx([eventsLogActions.Play], (state) => {
    state.playing = true;
  }),
  pause: tx([eventsLogActions.Pause, insightsActions.PlayDone], (state) => {
    state.playing = false;
  }),
  expand: tx([subscribersGraphActions.Expand], (state, action) => {
    const { target, key } = action.payload;
    const { expandedKeys } = state.targetsUi[target];
    expandedKeys.add(key);
    updateKeyMapping(state, target);
  }),
  collapse: tx([subscribersGraphActions.Collapse], (state, action) => {
    const { target, key } = action.payload;
    const { expandedKeys } = state.targetsUi[target];
    expandedKeys.delete(key);
    updateKeyMapping(state, target);
  }),
  expandAll: tx([subscribersGraphActions.ExpandAll], (state, action) => {
    const { target, key } = action.payload;
    const { relations } = state.targets[target];
    const { expandedKeys } = state.targetsUi[target];
    expandVisitor(
      new Set(),
      relations,
      getSourceChildren,
      getSourceChildKey,
      expandedKeys,
      key
    );
    expandVisitor(
      new Set(),
      relations,
      getDestinationChildren,
      getDestinationChildKey,
      expandedKeys,
      key
    );
    updateKeyMapping(state, target);
  }),
  collapseAll: tx([subscribersGraphActions.CollapseAll], (state, action) => {
    const { target, key } = action.payload;
    const { expandedKeys } = state.targetsUi[target];
    for (const expandedKey of Array.from(expandedKeys.values())) {
      if (expandedKey.startsWith(key) || expandedKey.endsWith(key)) {
        expandedKeys.delete(expandedKey);
      }
    }
    updateKeyMapping(state, target);
  }),
  focusTarget: tx([subscribersGraphActions.FocusTarget], (state, action) => {
    const { fromTarget, toTarget, toKey } = action.payload;
    const { keysMapping } = state.targetsUi[fromTarget.id];
    const rebasedKeysMapping = rebaseKeys(keysMapping, toKey);
    state.targetsUi[toTarget.id] = state.targetsUi[toTarget.id] ?? {
      expandedKeys: new Set([`<${toTarget.id}>`]),
    };
    state.targetsUi[toTarget.id].keysMapping = rebasedKeysMapping;
  }),
  followEvent: tx([subscribersGraphActions.FollowEvent], (state) => {
    state.following = true;
  }),
  unfollowEvent: tx([subscribersGraphActions.UnfollowEvent], (state) => {
    state.following = false;
  }),
  showExcludedEvents: tx(
    [subscribersGraphActions.ShowExcludedEvents],
    (state) => {
      state.showExcludedEvents = true;
    }
  ),
  hideExcludedEvents: tx(
    [subscribersGraphActions.HideExcludedEvents],
    (state) => {
      state.showExcludedEvents = false;
    }
  ),
});
