import { createReducer, Slice } from '@lib/store';
import { insightsActions } from '@app/actions/insights-actions';
import { RelatedTarget, Relations, TargetState } from '@app/protocols/insights';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';
import { rebaseKeys } from '@app/store/insights/rebase-keys';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';
import { inspectedWindowActions } from '@app/actions/inspected-window-actions';
import {
  getDestinationChildKey,
  getDestinationChildren,
  getSourceChildKey,
  getSourceChildren,
} from '@app/utils/related-children';
import {
  getRootTargetIdFromKey,
  getTargetIdFromKey,
} from '@app/pages/target-page/get-root-target-id';

let nextKeyId = 0;

export interface TargetUiState {
  expandedKeys: Set<string>;
  keysMapping: Record<string, number>;
}

export interface InsightsState {
  time: number;
  playing: boolean;
  following: boolean;
  targetsUi: Record<number, TargetUiState>;
  targets: Record<number, TargetState>;
}

export type InsightsSlice = Slice<'insights', InsightsState>;

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
  time: 0,
  playing: false,
  following: false,
  targetsUi: {},
  targets: {},
};

export const insightsReducer = createReducer('insights', initialState)
  .add(inspectedWindowActions.InspectedWindowReloaded, () => {
    return initialState;
  })
  .add(insightsActions.TargetStateLoaded, (state, action) => {
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
  })
  .add(eventsLogActions.EventSelected, (state, action) => {
    state.time = action.payload.event.time;
  })
  .add(refOutletContextActions.FocusEvent, (state, action) => {
    state.time = action.payload.event.time;
  })
  .add(insightsActions.PlayNextEvent, (state, action) => {
    state.time = action.payload.event.time;
  })
  .add(eventsLogActions.Play, (state) => {
    state.playing = true;
  })
  .add(eventsLogActions.Pause, (state) => {
    state.playing = false;
  })
  .add(insightsActions.PlayDone, (state) => {
    state.playing = false;
  })
  .add(subscribersGraphActions.Expand, (state, action) => {
    const { target, key } = action.payload;
    const { expandedKeys } = state.targetsUi[target];
    expandedKeys.add(key);
    updateKeyMapping(state, target);
  })
  .add(subscribersGraphActions.Collapse, (state, action) => {
    const { target, key } = action.payload;
    const { expandedKeys } = state.targetsUi[target];
    expandedKeys.delete(key);
    updateKeyMapping(state, target);
  })
  .add(subscribersGraphActions.ExpandAll, (state, action) => {
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
  })
  .add(subscribersGraphActions.CollapseAll, (state, action) => {
    const { target, key } = action.payload;
    const { expandedKeys } = state.targetsUi[target];
    for (const expandedKey of Array.from(expandedKeys.values())) {
      if (expandedKey.startsWith(key) || expandedKey.endsWith(key)) {
        expandedKeys.delete(expandedKey);
      }
    }
    updateKeyMapping(state, target);
  })
  .add(subscribersGraphActions.FocusTarget, (state, action) => {
    const { target, fromKey, toKey } = action.payload;
    const { keysMapping } = state.targetsUi[Number(fromKey)];
    const rebasedKeysMapping = rebaseKeys(keysMapping, toKey);
    state.targetsUi[target.id] = state.targetsUi[target.id] ?? {
      expandedKeys: new Set([String(target.id)]),
    };
    state.targetsUi[target.id].keysMapping = rebasedKeysMapping;
  })
  .add(subscribersGraphActions.FollowEvent, (state) => {
    state.following = true;
  })
  .add(subscribersGraphActions.UnfollowEvent, (state) => {
    state.following = false;
  });
