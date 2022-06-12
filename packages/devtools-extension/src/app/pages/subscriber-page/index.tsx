import React, { useEffect, useMemo, useRef } from 'react';
import { useSelector } from '@app/store';
import { RefOutlet } from '@app/components/ref-outlet';
import { Box, Stack, Theme, useTheme } from '@mui/material';
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
  RelatedTarget,
  Relations,
} from '@app/protocols/insights';
import { getDoubleTree } from '@app/components/tree';
import { activeSubscriberStateSelector } from '@app/selectors/active-target-state-selector';
import { timeSelector } from '@app/selectors/insights-selectors';
import {
  DefaultNodeControl,
  NodeControl,
} from '@app/components/graph/node-control';

import gsap from 'gsap';
import { Locations } from '@rxjs-insights/core';
import { SidePanel, SidePanelSection } from '@app/components';
import { EventsPanel } from '@app/pages/subscriber-page/events-panel';

function getTargetColors(theme: Theme, target: RelatedTarget) {
  switch (target.type) {
    case 'subscriber':
      return theme.insights.subscriber;
    case 'observable':
      return theme.insights.observable;
  }
}

function getEventColors(theme: Theme, event: RelatedEvent) {
  switch (event.eventType) {
    case 'next':
      return theme.insights.event.next;
    case 'error':
      return theme.insights.event.error;
    case 'complete':
      return theme.insights.event.complete;
    case 'subscribe':
    case 'unsubscribe':
      return theme.insights.event.subscription;
  }
}

function getDirection(
  type: 'next' | 'error' | 'complete' | 'subscribe' | 'unsubscribe'
) {
  switch (type) {
    case 'next':
    case 'error':
    case 'complete':
      return 1;
    case 'subscribe':
    case 'unsubscribe':
      return -1;
  }
}

const circleRadius = 6;
const circleCircumference = 2 * Math.PI * circleRadius;

function getLocationStrings(locations: Locations) {
  const location = locations.generatedLocation ?? locations.generatedLocation;
  if (location) {
    const { file, line, column } = location;
    const short = `${file.split('/').at(-1)}:${line}`;
    const long = `${file}:${line}:${column}`;
    return { short, long };
  } else {
    return undefined;
  }
}

function getNodeRenderer(relations: Relations, rootTargetId: number) {
  return React.forwardRef<NodeControl, NodeRendererProps<RelatedHierarchyNode>>(
    function NodeRenderer({ node }, forwardedRef) {
      const elementRef = useRef<SVGGElement | null>(null);
      React.useImperativeHandle(
        forwardedRef,
        () => new DefaultNodeControl(elementRef),
        []
      );
      const theme = useTheme();
      const time = useSelector(timeSelector);
      const event = relations.events[time];
      const target = relations.targets[node.data.target];
      const isRoot = target.id === rootTargetId;
      const isSelected = event && event.target === target.id;
      const isActive = target.startTime <= time && time <= target.endTime;

      const targetColors = getTargetColors(theme, target);
      const eventColors = getEventColors(theme, event);

      const circleRef = useRef<SVGCircleElement | null>(null);
      const tweenRef = useRef<gsap.core.Tween | null>(null);

      useEffect(() => {
        tweenRef.current?.kill();
        if (isSelected) {
          const direction = getDirection(event.eventType);
          tweenRef.current = gsap.fromTo(
            circleRef.current!,
            {
              strokeDasharray: circleCircumference / 12,
              strokeDashoffset: circleCircumference * direction,
            },
            {
              strokeDashoffset: 0,
              duration: 1,
              repeat: -1,
              ease: 'none',
            }
          );
        } else {
          gsap.set(elementRef.current!, {
            strokeDasharray: 'none',
            strokeDashoffset: 0,
          });
        }
      }, [isSelected && event.eventType]);

      const location = getLocationStrings(target.locations);

      return (
        <g ref={elementRef}>
          <circle
            r="4"
            fill={
              isActive ? targetColors.secondary : theme.palette.action.disabled
            }
          />
          {isRoot && (
            <circle
              r={5}
              fill="transparent"
              stroke={
                isActive
                  ? targetColors.primary
                  : theme.palette.action.disabledBackground
              }
            />
          )}
          {isSelected && (
            <circle
              ref={circleRef}
              r={circleRadius}
              fill="transparent"
              stroke={eventColors.secondary}
            />
          )}
          <text
            fontFamily="Monospace"
            fontStyle="oblique"
            fontSize="6"
            textAnchor="middle"
            fill={targetColors.secondary}
            y="12"
          >
            {target.name}{' '}
            <tspan fill={theme.palette.text.secondary}>#{target.id}</tspan>
          </text>
          {location && (
            <text
              fontFamily="Monospace"
              fontStyle="oblique"
              fontSize="4"
              textAnchor="middle"
              fill={theme.palette.text.secondary}
              y="18"
            >
              {location.short}
              <title>{location.long}</title>
            </text>
          )}
        </g>
      );
    }
  );
}

function getLinkRenderer(relations: Relations) {
  return React.forwardRef<LinkControl, LinkRendererProps<RelatedHierarchyNode>>(
    function LinkRenderer({ link }, forwardedRef) {
      const theme = useTheme();
      const time = useSelector(timeSelector);
      const event = relations.events[time];
      const target = relations.targets[link.source.data.target];
      const isSelected = event && event.target === target.id;

      const elementRef = useRef<SVGPathElement | null>(null);
      React.useImperativeHandle(
        forwardedRef,
        () => new DefaultLinkControl(elementRef, 6),
        []
      );

      const targetColors = getTargetColors(theme, target);
      const eventColors = getEventColors(theme, event);

      const tweenRef = useRef<gsap.core.Tween | null>(null);
      useEffect(() => {
        tweenRef.current?.kill();
        if (isSelected) {
          const direction = getDirection(event.eventType);
          tweenRef.current = gsap.fromTo(
            elementRef.current!,
            { strokeDasharray: 4, strokeDashoffset: 32 * direction },
            {
              strokeDashoffset: 0,
              duration: 1,
              repeat: -1,
              ease: 'none',
            }
          );
        } else {
          gsap.set(elementRef.current!, {
            strokeDasharray: 'none',
            strokeDashoffset: 0,
          });
        }
      }, [isSelected && event.eventType]);

      return (
        <path
          ref={elementRef}
          stroke={isSelected ? eventColors.secondary : targetColors.secondary}
          fill="transparent"
        />
      );
    }
  );
}

export function SubscriberPage() {
  const time = useSelector(timeSelector);
  const state = useSelector(activeSubscriberStateSelector)!;
  const NodeRenderer = useMemo(
    () => getNodeRenderer(state.relations, state.ref.id),
    [state]
  );
  const LinkRenderer = useMemo(() => getLinkRenderer(state.relations), [state]);
  const { nodes, links } = useMemo(() => {
    return getDoubleTree(
      state.hierarchy.sources,
      state.hierarchy.destinations,
      (data, path) =>
        [...path, data].map((x: RelatedHierarchyNode) => x.target).join('/'),
      (data) => {
        const target = state.relations.targets[data.target];
        return time !== undefined &&
          time >= target.startTime &&
          time <= target.endTime
          ? data.children.filter((child) => {
              const childTarget = state.relations.targets[child.target];
              return (
                time !== undefined &&
                time >= childTarget.startTime &&
                time <= childTarget.endTime
              );
            })
          : [];
      }
    );
  }, [state, time]);
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
        <SidePanelSection title="CONTEXT" basis={1}>
          <Stack>
            <RefOutlet label="target" reference={state.ref} />
            {event && <RefOutlet label="event" reference={event} />}
          </Stack>
        </SidePanelSection>
        <SidePanelSection title="EVENTS" basis={2}>
          <EventsPanel />
        </SidePanelSection>
      </SidePanel>
      <Box sx={{ flexGrow: 1, flexShrink: 1 }}>
        <Graph
          key={state.ref.id}
          nodes={nodes}
          links={links}
          nodeRenderer={NodeRenderer}
          linkRenderer={LinkRenderer}
        />
      </Box>
    </Box>
  );
}
