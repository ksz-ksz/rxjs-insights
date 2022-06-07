import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { useSelector } from '@app/store';
import { RefOutlet } from '@app/components/ref-outlet';
import { Box, Divider, styled } from '@mui/material';
import { Graph, NodeRendererProps } from '@app/components/graph';
import {
  RelatedEvent,
  RelatedHierarchyNode,
  RelatedTask,
  Relations,
  TargetId,
} from '@app/protocols/insights';
import { getDoubleTree } from '@app/components/tree';
import { activeSubscriberStateSelector } from '@app/selectors/active-target-state-selector';

function getTarget(relations: Relations, target: TargetId) {
  switch (target.type) {
    case 'subscriber':
      return relations.subscribers[target.id];
    case 'observable':
      return relations.observables[target.id];
  }
}

function getNodeRenderer(relations: Relations) {
  return function NodeRenderer({
    node,
  }: NodeRendererProps<RelatedHierarchyNode>) {
    const target = getTarget(relations, node.data.target);
    return (
      <>
        <circle r="6" fill="green" />
        <text fontSize="6" y="12" textAnchor="middle" fill="white">
          {target.name}#{target.id}
        </text>
      </>
    );
  };
}

interface EventEntry {
  type: 'event';
  indent: number;
  event: RelatedEvent;
}

// interface EventContinuationEntry {
//   type: 'event-continuation';
//   indent: number;
//   task: RelatedTask;
//   event: RelatedEvent;
// }

interface TaskEntry {
  type: 'task';
  task: RelatedTask;
}

type Entry = EventEntry | TaskEntry;

function getEventLog(relations: Relations) {
  const events = Object.values(relations.events).sort(
    (a, b) => a.time - b.time
  );

  const entries: Entry[] = [];
  let indent = 0;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const prevEvent = events[i - 1];
    if (prevEvent?.task !== event.task) {
      entries.push({
        type: 'task',
        task: relations.tasks[event.task],
      });
    }
    indent =
      prevEvent !== undefined && prevEvent.time === event.precedingEvent
        ? indent + 1
        : 0;
    entries.push({
      type: 'event',
      event: event,
      indent,
    });
  }

  return entries;
}

const IndentSpan = styled('span')(({ theme }) => ({
  display: 'inline-block',
  width: '1rem',
  height: '1.5rem',
  borderRight: `thin solid ${theme.palette.divider}`,
  margin: '-0.25rem 0',
}));

const TaskSpan = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.palette.text.secondary,
  marginLeft: '1rem',
  '&:after': {
    borderTop: `thin solid ${theme.palette.divider}`,
    content: '""',
    flexGrow: 1,
    alignSelf: 'center',
    marginLeft: '1rem',
  },
}));

const SidePanelDiv = styled('div')({
  display: 'flex',
  flexDirection: 'row',
});

const SidePanelContentDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

const SidePanelResizerDiv = styled('div')(({ theme }) => ({
  width: '8px',
  borderLeft: `thin solid ${theme.palette.divider}`,
}));

const SidePanelSectionDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  flexBasis: 0,
});

const SidePanelSectionHeaderDiv = styled('div')(({ theme }) => ({
  padding: '0 1rem',
  backgroundColor: theme.palette.divider,
  fontFamily: 'Monospace',
  fontWeight: 'bold',
}));

const SidePanelSectionBodyDiv = styled('div')({
  overflow: 'auto',
});

export interface SidePanelProps {
  children: ReactNode | ReactNode[];
}

export function SidePanel(props: SidePanelProps) {
  return (
    <SidePanelDiv>
      <SidePanelContentDiv>{props.children}</SidePanelContentDiv>
      <SidePanelResizerDiv />
    </SidePanelDiv>
  );
}

export interface SidePanelSectionProps {
  title: string;
  basis: number;
  children: ReactNode | ReactNode[];
}

export function SidePanelSection(props: SidePanelSectionProps) {
  return (
    <SidePanelSectionDiv
      sx={{ flexGrow: props.basis, flexShrink: props.basis }}
    >
      <SidePanelSectionHeaderDiv>{props.title}</SidePanelSectionHeaderDiv>
      <SidePanelSectionBodyDiv>{props.children}</SidePanelSectionBodyDiv>
    </SidePanelSectionDiv>
  );
}

const EventsLogDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  whiteSpace: 'nowrap',
  marginRight: '1rem',
  marginTop: '0.5rem',
  marginBottom: '0.5rem',
});

export interface EventsLogProps {
  entries: Entry[];
  onEventSelected(event: RelatedEvent): void;
}

export function EventsLog(props: EventsLogProps) {
  return (
    <EventsLogDiv>
      {props.entries.map((entry) =>
        entry.type === 'event' ? (
          <a onClick={() => props.onEventSelected(entry.event)}>
            {new Array(entry.indent).fill(0).map((x, i) => (
              <IndentSpan />
            ))}
            <RefOutlet reference={entry.event} />
          </a>
        ) : (
          <TaskSpan>
            {entry.task.name} #{entry.task.id}
          </TaskSpan>
        )
      )}
    </EventsLogDiv>
  );
}

export function SubscriberPage() {
  const [time, setTime] = useState(0);
  const state = useSelector(activeSubscriberStateSelector)!;
  const NodeRenderer = useMemo(
    () => (state ? getNodeRenderer(state.relations) : undefined),
    [state]
  );
  const { nodes, links } = useMemo(
    () =>
      state
        ? getDoubleTree(
            state.hierarchy.sources,
            state.hierarchy.destinations,
            (data, path) =>
              [...path, data]
                .map((x: RelatedHierarchyNode) => x.target.id)
                .join('/'),
            (data) =>
              data.children.filter((child) => {
                const childTarget = getTarget(state.relations, child.target);
                return (
                  childTarget.startTime <= time && time <= childTarget.endTime
                );
              })
          )
        : { nodes: [], links: [] },
    [state, time]
  );
  console.log({ nodes, links });
  const entries = useMemo(
    () => (state ? getEventLog(state.relations) : []),
    [state]
  );
  const onEventSelected = useCallback(
    (event: RelatedEvent) => {
      setTime(event.time);
    },
    [setTime]
  );
  const ref = state?.ref;
  if (ref) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <SidePanel>
          <SidePanelSection title="EVENTS" basis={2}>
            <EventsLog entries={entries} onEventSelected={onEventSelected} />
          </SidePanelSection>
          <SidePanelSection title="CONTEXT" basis={1}>
            <RefOutlet label="root" reference={state.ref} />
            <RefOutlet label="event" reference={state.relations.events[time]} />
          </SidePanelSection>
        </SidePanel>
        <Box sx={{ flexGrow: 1, flexShrink: 1 }}>
          <Graph nodes={nodes} links={links} nodeRenderer={NodeRenderer} />
        </Box>
      </Box>
    );
  } else {
    return null;
  }
}
