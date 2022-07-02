import { createReducer, Slice } from '@lib/store';
import { insightsActions } from '@app/actions/insights-actions';
import { RelatedTarget, Relations, TargetState } from '@app/protocols/insights';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';
import { rebaseKeys } from '@app/store/insights/rebase-keys';

let nextKeyId = 0;

export interface SubscriberUiState {
  expandedKeys: Set<string>;
  keysMapping: Record<string, number>;
}

export interface InsightsState {
  time: number;
  playing: boolean;
  targetsUi: Record<number, SubscriberUiState>;
  targets: Record<number, TargetState>;
}

export type InsightsSlice = Slice<'insights', InsightsState>;

function expandVisitor(
  visitedTargets: Set<number>,
  relations: Relations,
  relation: 'sources' | 'destinations',
  expandedKeys: Set<string>,
  key: string
) {
  const targetId = Number(key.split('.').pop());
  if (visitedTargets.has(targetId)) {
    return;
  }
  expandedKeys.add(key);
  const target = relations.targets[targetId];
  const relatedTargets = target[relation];
  if (relatedTargets) {
    visitedTargets.add(targetId);
    for (const id of relatedTargets) {
      expandVisitor(
        visitedTargets,
        relations,
        relation,
        expandedKeys,
        `${key}.${id}`
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
  relation: 'sources' | 'destinations'
) {
  keyMapping[targetKey] = existingKeyMapping[targetKey] ?? nextKeyId++;
  if (expandedKeys.has(targetKey)) {
    for (const childTargetId of target[relation]!) {
      const childTarget = relations.targets[childTargetId];
      const childTargetKey = `${targetKey}.${childTargetId}`;
      getKeysMappingVisitor(
        expandedKeys,
        keyMapping,
        existingKeyMapping,
        childTarget,
        childTargetKey,
        relations,
        relation
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
    String(target.id),
    relations,
    'sources'
  );
  getKeysMappingVisitor(
    expandedKeys,
    keyMapping,
    existingKeyMapping,
    target,
    String(target.id),
    relations,
    'destinations'
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

export const insightsReducer = createReducer('insights', {
  time: 0,
  playing: false,
  targetsUi: {},
  targets: {},
} as InsightsState)
  .add(insightsActions.TargetStateLoaded, (state, action) => {
    const { state: targetState } = action.payload;
    if (targetState !== undefined) {
      state.targets[targetState.target.id] = targetState;
      if (!state.targetsUi[targetState.target.id]) {
        const expandedKeys = new Set([String(targetState.target.id)]);
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
    expandVisitor(new Set(), relations, 'sources', expandedKeys, key);
    expandVisitor(new Set(), relations, 'destinations', expandedKeys, key);
    updateKeyMapping(state, target);
  })
  .add(subscribersGraphActions.CollapseAll, (state, action) => {
    const { target, key } = action.payload;
    const { expandedKeys } = state.targetsUi[target];
    for (const expandedKey of Array.from(expandedKeys.values())) {
      if (expandedKey.startsWith(key)) {
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
  });
