import React, {
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from '@app/store';
import { RefOutlet } from '@app/components/ref-outlet';
import { Box, Divider, Stack, styled } from '@mui/material';
import {
  DefaultLinkControl,
  Graph,
  LinkControl,
  LinkRendererProps,
  NodeRendererProps,
} from '@app/components/graph';
import {
  RelatedEvent,
  RelatedHierarchyNode,
  RelatedTask,
  Relations,
  TargetId,
} from '@app/protocols/insights';
import { getDoubleTree } from '@app/components/tree';
import { activeSubscriberStateSelector } from '@app/selectors/active-target-state-selector';
import { timeSelector } from '@app/selectors/insights-selectors';
import { eventsLogActions } from '@app/actions/events-log-actions';
import {
  DefaultNodeControl,
  NodeControl,
} from '@app/components/graph/node-control';

function getTarget(relations: Relations, target: TargetId) {
  switch (target.type) {
    case 'subscriber':
      return relations.subscribers[target.id];
    case 'observable':
      return relations.observables[target.id];
  }
}

function getNodeRenderer(relations: Relations) {
  return React.forwardRef<NodeControl, NodeRendererProps<RelatedHierarchyNode>>(
    function DefaultNodeRenderer({ node }, forwardedRef) {
      const time = useSelector(timeSelector);
      const event = relations.events[time];
      const target = getTarget(relations, node.data.target);
      const selected = event && event.target.id === target.id;

      const elementRef = useRef<SVGGElement | null>(null);
      React.useImperativeHandle(
        forwardedRef,
        () => new DefaultNodeControl(elementRef),
        []
      );

      return (
        <g ref={elementRef}>
          <circle r="6" fill={selected ? 'red' : 'green'} />
          <text fontSize="6" y="12" textAnchor="middle" fill="white">
            {target.name}#{target.id}
          </text>
        </g>
      );
    }
  );
}

function getLinkRenderer(relations: Relations) {
  return React.forwardRef<LinkControl, LinkRendererProps<RelatedHierarchyNode>>(
    function DefaultLinkRenderer({ link }, forwardedRef) {
      const time = useSelector(timeSelector);
      const event = relations.events[time];
      const target = getTarget(relations, link.source.data.target);
      const selected = event && event.target.id === target.id;

      const elementRef = useRef<SVGPathElement | null>(null);
      React.useImperativeHandle(
        forwardedRef,
        () => new DefaultLinkControl(elementRef),
        []
      );

      return (
        <path
          ref={elementRef}
          stroke={selected ? 'red' : 'green'}
          fill="transparent"
        />
      );
    }
  );
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
  const indents: Record<number, number> = {};
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const prevEvent = events[i - 1];
    if (prevEvent?.task !== event.task) {
      entries.push({
        type: 'task',
        task: relations.tasks[event.task],
      });
    }
    const indent = event.precedingEvent ? indents[event.precedingEvent] + 1 : 0;
    indents[event.time] = indent;
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
  marginTop: '0.5rem',
  marginBottom: '0.5rem',
});

interface IndentProps {
  indent: number;
}

function Indent({ indent }: IndentProps) {
  const children = useMemo(() => {
    const children: ReactNode[] = [];
    for (let i = 0; i < indent; i++) {
      children.push(<IndentSpan />);
    }
    return children;
  }, [indent]);
  return <>{children}</>;
}

const EventSpan = styled('span')(({ theme }) => ({
  paddingRight: '1rem',
  '&[data-selected=true]': {
    backgroundColor: theme.palette.action.selected,
  },
}));

export function EventsLog() {
  const dispatch = useDispatch();
  const time = useSelector(timeSelector);
  const state = useSelector(activeSubscriberStateSelector)!;
  const entries = useMemo(
    () => (state ? getEventLog(state.relations) : []),
    [state]
  );
  const onEventSelected = useCallback(
    (event: RelatedEvent) =>
      dispatch(eventsLogActions.EventSelected({ event })),
    []
  );
  return (
    <EventsLogDiv>
      {entries.map((entry) =>
        entry.type === 'event' ? (
          <EventSpan
            data-type={entry.event.eventType}
            data-selected={entry.event.time === time}
            onClick={() => onEventSelected(entry.event)}
          >
            <Indent indent={entry.indent} />
            <RefOutlet summary reference={entry.event} />
          </EventSpan>
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
  const time = useSelector(timeSelector);
  const state = useSelector(activeSubscriberStateSelector)!;
  const NodeRenderer = useMemo(() => getNodeRenderer(state.relations), [state]);
  const LinkRenderer = useMemo(() => getLinkRenderer(state.relations), [state]);
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
                  time !== undefined &&
                  childTarget.startTime <= time &&
                  time <= childTarget.endTime
                );
              })
          )
        : { nodes: [], links: [] },
    [state, time]
  );
  const event = state.relations.events[time];
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
          <EventsLog />
        </SidePanelSection>
        <SidePanelSection title="CONTEXT" basis={1}>
          <Stack>
            <RefOutlet label="root" reference={state.ref} />
            {event && <RefOutlet label="event" reference={event} />}
          </Stack>
        </SidePanelSection>
      </SidePanel>
      <Box sx={{ flexGrow: 1, flexShrink: 1 }}>
        <Graph
          nodes={nodes}
          links={links}
          nodeRenderer={NodeRenderer}
          linkRenderer={LinkRenderer}
        />
      </Box>
    </Box>
  );
}
