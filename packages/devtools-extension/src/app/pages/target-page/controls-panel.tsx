import { RelatedEvent } from '@app/protocols/insights';
import React from 'react';
import { styled } from '@mui/material';
import { useSelector } from '@app/store';
import { playingSelector } from '@app/selectors/insights-selectors';
import {
  activeTargetStateSelector,
  activeTargetUiStateSelector,
} from '@app/selectors/active-target-state-selector';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { createSelector, useDispatchCallback } from '@lib/store';
import { getTargetTimeframes } from '@app/pages/target-page/get-target-timeframes';
import { getEvents } from '@app/pages/target-page/get-events';
import { getIncludedEvents } from '@app/pages/target-page/get-included-events';
import { EventsTimeline } from '@app/pages/target-page/events-timeline';
import { EventsControls } from '@app/pages/target-page/events-controls';
import { timeSelector } from '@app/selectors/time-selectors';

function findLastIndex<T>(items: T[], predicate: (item: T) => boolean): number {
  for (let i = items.length - 1; i >= 0; i--) {
    if (predicate(items[i])) {
      return i;
    }
  }
  return -1;
}

function findFirstIndex<T>(
  items: T[],
  predicate: (item: T) => boolean
): number {
  for (let i = 0; i < items.length; i++) {
    if (predicate(items[i])) {
      return i;
    }
  }
  return -1;
}

const eventsSelector = createSelector(
  [activeTargetStateSelector, activeTargetUiStateSelector],
  ([activeTargetState, activeTargetUiState]) => {
    const { target, relations } = activeTargetState!;
    const { expandedKeys } = activeTargetUiState!;
    const timeframes = getTargetTimeframes(target, relations, expandedKeys);
    const allEvents = getEvents(relations);
    const events = getIncludedEvents(relations, allEvents, timeframes);

    return { events, relations };
  }
);

const vmSelector = createSelector(
  [eventsSelector, timeSelector, playingSelector],
  ([{ events, relations }, time, playing]) => ({
    events,
    time,
    playing,
    event: relations.events[time],
  })
);

function binarySearch<T, U>(
  array: T[],
  item: U,
  compare: (a: U, b: T) => number
) {
  let m = 0;
  let n = array.length - 1;
  while (m <= n) {
    const k = (n + m) >> 1;
    const c = compare(item, array[k]);
    if (c > 0) {
      m = k + 1;
    } else if (c < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return -m - 1;
}

function getClosestEvent(
  events: RelatedEvent[],
  index: number,
  timestamp: number
) {
  const a = events[index - 1];
  const b = events[index];
  if (
    a &&
    Math.abs(a.timestamp - timestamp) < Math.abs(b.timestamp - timestamp)
  ) {
    return a;
  } else {
    return b;
  }
}

const ControlsDiv = styled('div')({});

export function ControlsPanel() {
  const vm = useSelector(vmSelector);

  const onGoToFirst = useDispatchCallback(() => {
    const first = vm.events.at(0)!;
    return eventsLogActions.EventSelected({ event: first });
  }, [vm.events]);

  const onGoToPrev = useDispatchCallback(() => {
    const prevEventIndex = findLastIndex(
      vm.events,
      (event) => event.time < vm.time
    );
    const prevEvent = vm.events[prevEventIndex];
    return prevEvent
      ? eventsLogActions.EventSelected({ event: prevEvent })
      : undefined;
  }, [vm.events, vm.time]);

  const onPlay = useDispatchCallback(() => {
    const nextEventIndex = findFirstIndex(
      vm.events,
      (event) => event.time > vm.time
    );
    const restEvents = vm.events.slice(nextEventIndex);
    return eventsLogActions.Play({ events: restEvents });
  }, [vm.events, vm.time]);

  const onPause = useDispatchCallback(() => eventsLogActions.Pause(), []);

  const onGoToNext = useDispatchCallback(() => {
    const nextEventIndex = findFirstIndex(
      vm.events,
      (event) => event.time > vm.time
    );
    const nextEvent = vm.events[nextEventIndex];
    return nextEvent
      ? eventsLogActions.EventSelected({ event: nextEvent })
      : undefined;
  }, [vm.events, vm.time]);

  const onGoToLast = useDispatchCallback(() => {
    const last = vm.events.at(-1)!;
    return eventsLogActions.EventSelected({ event: last });
  }, [vm.events]);

  const onTimestampSelected = useDispatchCallback(
    (timestamp) => {
      const index = binarySearch(
        vm.events,
        timestamp,
        (t, e) => t - e.timestamp
      );
      const event =
        index >= 0
          ? vm.events[index]
          : getClosestEvent(vm.events, -index - 1, timestamp);
      return eventsLogActions.EventSelected({ event });
    },
    [vm.events]
  );

  return (
    <ControlsDiv>
      <EventsTimeline
        events={vm.events}
        event={vm.event}
        onTimestampSelected={onTimestampSelected}
      />
      <EventsControls
        playing={vm.playing}
        onGoToFirst={onGoToFirst}
        onGoToPrev={onGoToPrev}
        onPlay={onPlay}
        onPause={onPause}
        onGoToNext={onGoToNext}
        onGoToLast={onGoToLast}
      />
    </ControlsDiv>
  );
}
