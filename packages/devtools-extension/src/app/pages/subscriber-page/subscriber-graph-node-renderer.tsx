import { Locations } from '@rxjs-insights/core';
import React, { useEffect, useRef } from 'react';
import {
  DefaultNodeControl,
  duration,
  NodeControl,
  NodeRendererProps,
} from '@app/components/graph';
import { Theme, useTheme } from '@mui/material';
import { useSelectorFunction } from '@app/store';
import { timeSelector } from '@app/selectors/insights-selectors';
import {
  getDirection,
  getEventColors,
  getTargetColors,
} from '@app/pages/subscriber-page/subscriber-graph-utils';
import gsap from 'gsap';
import { createSelector, useDispatchCallback } from '@lib/store';
import {
  activeSubscriberStateSelector,
  activeSubscriberUiStateSelector,
} from '@app/selectors/active-target-state-selector';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';
import { RelatedTargetHierarchyNode } from '@app/pages/subscriber-page/related-target-hierarchy-node';

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

const vmSelector = (node: RelatedTargetHierarchyNode, theme: Theme) =>
  createSelector(
    [
      activeSubscriberStateSelector,
      activeSubscriberUiStateSelector,
      timeSelector,
    ],
    ([activeSubscriberState, activeSubscriberUiState, time]) => {
      const { ref, relations } = activeSubscriberState!;
      const { expandedKeys } = activeSubscriberUiState!;
      const root = relations.targets[ref.id];
      const target = relations.targets[node.target.id];
      const event = relations.events[time];
      const location = getLocationStrings(target.locations);
      const isRoot = !node.key.includes('.');
      const isActive = target.startTime <= time && time <= target.endTime;
      const isSelected = event && event.target === target.id;
      const isExpanded = expandedKeys.has(node.key);
      const targetColors = getTargetColors(theme, target);
      const rootNodeColor = isActive
        ? targetColors.primary
        : theme.palette.action.disabledBackground;
      const nodeColor = isActive
        ? targetColors.secondary
        : theme.palette.action.disabled;
      const selectedColor = event && getEventColors(theme, event).secondary;

      return {
        root,
        target,
        event,
        location,
        isRoot,
        isSelected,
        isExpanded,
        rootNodeColor,
        nodeColor,
        selectedColor,
      };
    }
  );

export const SubscriberGraphNodeRenderer = React.forwardRef<
  NodeControl,
  NodeRendererProps<RelatedTargetHierarchyNode>
>(function SubscriberGraphNodeRenderer({ node }, forwardedRef) {
  const elementRef = useRef<SVGGElement | null>(null);
  React.useImperativeHandle(
    forwardedRef,
    () => new DefaultNodeControl(elementRef),
    []
  );
  const theme = useTheme();
  const vm = useSelectorFunction(vmSelector, node.data, theme);

  const circleRef = useRef<SVGCircleElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const toggle = useDispatchCallback(
    () =>
      subscribersGraphActions.Toggle({
        target: vm.root.id,
        key: node.id as string,
        id: vm.target.id,
      }),
    [vm.target.id, node.id]
  );

  useEffect(() => {
    tweenRef.current?.kill();
    if (vm.isSelected) {
      const direction = getDirection(vm.event.eventType);
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
  }, [vm.isSelected && vm.event.eventType]);

  return (
    <g ref={elementRef} onClick={toggle}>
      <g
        opacity={vm.isExpanded || vm.isRoot ? 1 : 0.5}
        style={{ transition: `opacity ${duration}s` }}
      >
        <circle
          r={vm.isExpanded ? 4 : 3}
          fill={vm.nodeColor}
          style={{ transition: `r ${duration}s` }}
        />
        {vm.isRoot && (
          <circle r={5} fill="transparent" stroke={vm.rootNodeColor} />
        )}
        {vm.isSelected && (
          <circle
            ref={circleRef}
            r={circleRadius}
            fill="transparent"
            stroke={vm.selectedColor}
          />
        )}
        <text
          fontFamily="Monospace"
          fontStyle="oblique"
          fontSize="6"
          textAnchor="middle"
          fill={vm.nodeColor}
          y="12"
        >
          {vm.target.name}{' '}
          <tspan fill={theme.palette.text.secondary}>#{vm.target.id}</tspan>
        </text>
        {vm.location && (
          <text
            fontFamily="Monospace"
            fontStyle="oblique"
            fontSize="4"
            textAnchor="middle"
            fill={theme.palette.text.secondary}
            y="18"
          >
            {vm.location.short}
            <title>{vm.location.long}</title>
          </text>
        )}
      </g>
    </g>
  );
});
