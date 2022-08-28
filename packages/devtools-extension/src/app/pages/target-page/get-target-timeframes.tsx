import {
  OUT_OF_BOUNDS_MAX_TIME,
  OUT_OF_BOUNDS_MIN_TIME,
} from '@app/constants/timeframe';
import { RelatedTarget, Relations } from '@app/protocols/insights';
import {
  getDestinationChildKey,
  getDestinationChildren,
  getSourceChildKey,
  getSourceChildren,
} from '@app/utils/related-children';

export interface Timeframe {
  startTime: number;
  endTime: number;
}

function getTargetTimeframesVisitor(
  target: RelatedTarget,
  targetKey: string,
  relations: Relations,
  getChildren: (target: RelatedTarget) => number[],
  getChildKey: (childId: number, parentKey: string) => string,
  expandedKeys: Set<string>,
  parentTimeframe: Timeframe,
  timeframes: Record<number, Timeframe>
) {
  const timeframe: Timeframe = {
    startTime: Math.max(parentTimeframe.startTime, target.startTime),
    endTime: Math.min(parentTimeframe.endTime, target.endTime),
  };
  if (timeframes[target.id] === undefined) {
    timeframes[target.id] = timeframe;
  } else {
    const { startTime, endTime } = timeframes[target.id];
    timeframes[target.id] = {
      startTime: Math.min(startTime, timeframe.startTime),
      endTime: Math.max(endTime, timeframe.endTime),
    };
  }
  if (expandedKeys.has(targetKey)) {
    for (const childId of getChildren(target)) {
      const childTarget = relations.targets[childId];
      const childTargetKey = getChildKey(childId, targetKey);
      getTargetTimeframesVisitor(
        childTarget,
        childTargetKey,
        relations,
        getChildren,
        getChildKey,
        expandedKeys,
        timeframe,
        timeframes
      );
    }
  }
}

const maxTimeframe = {
  startTime: OUT_OF_BOUNDS_MIN_TIME,
  endTime: OUT_OF_BOUNDS_MAX_TIME,
};

export function getTargetTimeframes(
  target: RelatedTarget,
  relations: Relations,
  expandedKeys: Set<string>
) {
  const timeframes: Record<number, Timeframe> = {};
  getTargetTimeframesVisitor(
    target,
    `<${target.id}>`,
    relations,
    getSourceChildren,
    getSourceChildKey,
    expandedKeys,
    maxTimeframe,
    timeframes
  );
  getTargetTimeframesVisitor(
    target,
    `<${target.id}>`,
    relations,
    getDestinationChildren,
    getDestinationChildKey,
    expandedKeys,
    maxTimeframe,
    timeframes
  );
  return timeframes;
}
