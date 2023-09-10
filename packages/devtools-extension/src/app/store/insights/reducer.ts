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
import { createReducerFromActions } from '@lib/state-fx/store';

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
export const insightsReducer = createReducerFromActions({
  namespace: 'insights',
  initialState,
  reducers: (reducer) => ({
    resetState: reducer({
      action: [inspectedWindowActions.InspectedWindowReloaded],
      reduce: () => initialState,
    }),
    targetStateLoaded: reducer({
      action: [insightsActions.TargetStateLoaded],
      reduce: (state, action) => {
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
      },
    }),
    play: reducer({
      action: [eventsLogActions.Play],
      reduce: (state) => {
        state.playing = true;
      },
    }),
    pause: reducer({
      action: [eventsLogActions.Pause, insightsActions.PlayDone],
      reduce: (state) => {
        state.playing = false;
      },
    }),
    expand: reducer({
      action: [subscribersGraphActions.Expand],
      reduce: (state, action) => {
        const { target, key } = action.payload;
        const { expandedKeys } = state.targetsUi[target];
        expandedKeys.add(key);
        updateKeyMapping(state, target);
      },
    }),
    collapse: reducer({
      action: [subscribersGraphActions.Collapse],
      reduce: (state, action) => {
        const { target, key } = action.payload;
        const { expandedKeys } = state.targetsUi[target];
        expandedKeys.delete(key);
        updateKeyMapping(state, target);
      },
    }),
    expandAll: reducer({
      action: [subscribersGraphActions.ExpandAll],
      reduce: (state, action) => {
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
      },
    }),
    collapseAll: reducer({
      action: [subscribersGraphActions.CollapseAll],
      reduce: (state, action) => {
        const { target, key } = action.payload;
        const { expandedKeys } = state.targetsUi[target];
        for (const expandedKey of Array.from(expandedKeys.values())) {
          if (expandedKey.startsWith(key) || expandedKey.endsWith(key)) {
            expandedKeys.delete(expandedKey);
          }
        }
        updateKeyMapping(state, target);
      },
    }),
    focusTarget: reducer({
      action: [subscribersGraphActions.FocusTarget],
      reduce: (state, action) => {
        const { fromTarget, toTarget, toKey } = action.payload;
        const { keysMapping } = state.targetsUi[fromTarget.id];
        const rebasedKeysMapping = rebaseKeys(keysMapping, toKey);
        state.targetsUi[toTarget.id] = state.targetsUi[toTarget.id] ?? {
          expandedKeys: new Set([`<${toTarget.id}>`]),
        };
        state.targetsUi[toTarget.id].keysMapping = rebasedKeysMapping;
      },
    }),
    followEvent: reducer({
      action: [subscribersGraphActions.FollowEvent],
      reduce: (state) => {
        state.following = true;
      },
    }),
    unfollowEvent: reducer({
      action: [subscribersGraphActions.UnfollowEvent],
      reduce: (state) => {
        state.following = false;
      },
    }),
    showExcludedEvents: reducer({
      action: [subscribersGraphActions.ShowExcludedEvents],
      reduce: (state) => {
        state.showExcludedEvents = true;
      },
    }),
    hideExcludedEvents: reducer({
      action: [subscribersGraphActions.HideExcludedEvents],
      reduce: (state) => {
        state.showExcludedEvents = false;
      },
    }),
  }),
});
