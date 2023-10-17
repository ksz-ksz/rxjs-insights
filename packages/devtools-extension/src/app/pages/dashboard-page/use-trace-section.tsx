import { useSelector } from '@app/store';
import { SidePanelEntry } from '@app/components/side-panel';
import { createUrl, RouterLink } from '@lib/store-router';
import { old_router } from '@app/old_router';
import { RefSummaryOutlet } from '@app/components/ref-outlet';
import { Box, styled } from '@mui/material';
import { LocationOutlet } from '@app/components/location-outlet';
import React, { useMemo } from 'react';
import { traceSelector } from '@app/selectors/trace-selectors';
import { Trace } from '@app/protocols/traces';
import { EventRef, TargetRef } from '@app/protocols/refs';
import { Locations } from '@rxjs-insights/core';
import { old_createSelector } from '@lib/store';
import { EmptyStateRenderer } from '@app/pages/dashboard-page/empty-state-renderer';

interface TaskTraceEntry {
  type: 'task';
  task: {
    name: string;
    id: number;
  };
}

interface EventTraceEntry {
  type: 'event';
  event: EventRef;
  target: TargetRef;
  locations: Locations;
}

type TraceEntry = TaskTraceEntry | EventTraceEntry;

function getTraceEntries(trace: Trace): TraceEntry[] {
  const entries: TraceEntry[] = [];
  for (let i = 0; i < trace.length; i++) {
    const traceFrame = trace[i];
    const nextTraceFrame = trace[i + 1];
    entries.push({
      type: 'event',
      event: traceFrame.event,
      target: traceFrame.target,
      locations: traceFrame.locations,
    });
    if (
      nextTraceFrame === undefined ||
      traceFrame.task.id !== nextTraceFrame.task.id
    ) {
      entries.push({
        type: 'task',
        task: traceFrame.task,
      });
    }
  }
  return entries;
}

const vmSelector = old_createSelector(
  [traceSelector],
  ([trace]) => {
    const entries = trace.trace ? getTraceEntries(trace.trace) : [];
    return { entries };
  },
  (prev, next) => {
    if (prev.entries.length !== next.entries.length) {
      return false;
    }
    for (let i = 0; i < prev.entries.length; i++) {
      const prevEntry = prev.entries[i];
      const nextEntry = next.entries[i];
      if (prevEntry.type === 'event' && nextEntry.type === 'event') {
        if (prevEntry.event.time !== nextEntry.event.time) {
          return false;
        }
      } else if (prevEntry.type === 'task' && nextEntry.type === 'task') {
        if (prevEntry.task.id !== nextEntry.task.id) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }
);

const TaskDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '24px',
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.palette.text.secondary,
  marginLeft: '0.6rem',
  marginRight: '0.6rem',
  whiteSpace: 'nowrap',
  '&:after': {
    borderTop: `thin solid ${theme.palette.divider}`,
    content: '""',
    flexGrow: 1,
    alignSelf: 'center',
    marginLeft: '0.6rem',
  },
}));

const EventLink = styled(RouterLink)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '24px',
  whiteSpace: 'nowrap',
  paddingRight: '0.6rem',
  '&[data-selected=true]': {
    backgroundColor: theme.palette.action.selected,
  },
}));

function EventRenderer({ entry }: { entry: EventTraceEntry }) {
  return (
    <EventLink
      key={entry.target.id}
      router={old_router}
      to={createUrl(['target', String(entry.target.id)], {
        queryParams: {
          time: String(entry.event.time),
        },
      })}
    >
      <Box sx={{ whiteSpace: 'nowrap', marginRight: 1 }}>
        <RefSummaryOutlet reference={entry.event} details={false} />
        <RefSummaryOutlet reference={entry.target} />
      </Box>
      <LocationOutlet locations={entry.target.locations} />
    </EventLink>
  );
}

function TaskRenderer({ entry }: { entry: TaskTraceEntry }) {
  return (
    <TaskDiv>
      {entry.task.name} #{entry.task.id}
    </TaskDiv>
  );
}

export function useTraceSection() {
  const vm = useSelector(vmSelector);

  return useMemo(
    (): SidePanelEntry[] =>
      vm.entries.length !== 0
        ? vm.entries.map((entry): SidePanelEntry => {
            switch (entry.type) {
              case 'event':
                return {
                  key: `trace-event-${entry.event.time}`,
                  getHeight(): number {
                    return 24;
                  },
                  render() {
                    return <EventRenderer entry={entry} />;
                  },
                };
              case 'task':
                return {
                  key: `trace-task-${entry.task.id}`,
                  getHeight(): number {
                    return 24;
                  },
                  render() {
                    return <TaskRenderer entry={entry} />;
                  },
                };
            }
          })
        : [
            {
              key: 'trace-empty-state',
              getHeight(): number {
                return 48;
              },
              render() {
                return (
                  <EmptyStateRenderer text="Pause the debugger in the RxJS context to see the trace" />
                );
              },
            },
          ],
    [vm]
  );
}
