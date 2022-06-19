import { createReducer, Slice } from '@lib/store';
import { insightsActions } from '@app/actions/insights-actions';
import { Relations, TargetState } from '@app/protocols/insights';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';

export interface SubscriberUiState {
  expandedKeys: Set<string>;
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
  expandedKeys: Set<string>,
  key: string
) {
  const targetId = Number(key.split('.').pop());
  if (visitedTargets.has(targetId)) {
    return;
  }
  visitedTargets.add(targetId);
  expandedKeys.add(key);
  const target = relations.targets[targetId];
  // TODO: expand only in one direction
  if (target.sources) {
    for (const source of target.sources) {
      expandVisitor(
        visitedTargets,
        relations,
        expandedKeys,
        `${key}.${source}`
      );
    }
  }
  // TODO: expand only in one direction
  if (target.destinations) {
    for (const source of target.destinations!) {
      expandVisitor(
        visitedTargets,
        relations,
        expandedKeys,
        `${key}.${source}`
      );
    }
  }
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
        state.targetsUi[targetState.target.id] = {
          expandedKeys: new Set([String(targetState.target.id)]),
        };
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
  })
  .add(subscribersGraphActions.Collapse, (state, action) => {
    const { target, key } = action.payload;
    const { expandedKeys } = state.targetsUi[target];
    expandedKeys.delete(key);
  })
  .add(subscribersGraphActions.ExpandAll, (state, action) => {
    const { target, key } = action.payload;
    const { relations } = state.targets[target];
    const { expandedKeys } = state.targetsUi[target];
    expandVisitor(new Set(), relations, expandedKeys, key);
  })
  .add(subscribersGraphActions.CollapseAll, (state, action) => {
    const { target, key } = action.payload;
    const { expandedKeys } = state.targetsUi[target];
    for (const expandedKey of Array.from(expandedKeys.values())) {
      if (expandedKey.startsWith(key)) {
        expandedKeys.delete(expandedKey);
      }
    }
  });
