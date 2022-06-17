import {
  OUT_OF_BOUNDS_MAX_TIME,
  OUT_OF_BOUNDS_MIN_TIME,
} from '@app/constants/timeframe';
import { RelatedTarget, Relations } from '@app/protocols/insights';

export interface Timeframe {
  startTime: number;
  endTime: number;
}

function getTargetTimeframesVisitor(
  target: RelatedTarget,
  targetKey: string,
  relations: Relations,
  relation: 'sources' | 'destinations',
  expandedKeys: Set<string>,
  parentTimeframe: Timeframe,
  timeframes: Record<number, Timeframe>
) {
  const timeframe: Timeframe = {
    startTime: Math.min(parentTimeframe.startTime, target.startTime),
    endTime: Math.min(parentTimeframe.endTime, target.endTime),
  };
  if (timeframes[target.id] === undefined) {
    timeframes[target.id] = timeframe;
  } else {
    const { startTime, endTime } = timeframes[target.id];
    timeframes[target.id] = {
      startTime: Math.max(startTime, timeframe.startTime),
      endTime: Math.max(endTime, timeframe.endTime),
    };
  }
  if (expandedKeys.has(targetKey)) {
    for (const childId of target[relation]!) {
      const childTarget = relations.targets[childId];
      const childTargetKey = `${targetKey}.${childId}`;
      getTargetTimeframesVisitor(
        childTarget,
        childTargetKey,
        relations,
        relation,
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
    String(target.id),
    relations,
    'sources',
    expandedKeys,
    maxTimeframe,
    timeframes
  );
  getTargetTimeframesVisitor(
    target,
    String(target.id),
    relations,
    'destinations',
    expandedKeys,
    maxTimeframe,
    timeframes
  );
  return timeframes;
}
