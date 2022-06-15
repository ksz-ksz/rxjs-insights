import { Locations } from '@rxjs-insights/core';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  DefaultNodeControl,
  NodeControl,
  NodeRendererProps,
} from '@app/components/graph';
import { RelatedHierarchyNode } from '@app/protocols/insights';
import { useTheme } from '@mui/material';
import { useSelector, useSelectorFunction } from '@app/store';
import { timeSelector } from '@app/selectors/insights-selectors';
import {
  getDirection,
  getEventColors,
  getTargetColors,
} from '@app/pages/subscriber-page/subscriber-graph-utils';
import gsap from 'gsap';
import { createSelector, useDispatchCallback } from '@lib/store';
import { activeSubscriberStateSelector } from '@app/selectors/active-target-state-selector';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';

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

const vmSelector = (targetId: number) =>
  createSelector(
    [activeSubscriberStateSelector, timeSelector],
    ([activeSubscriberState, time]) => {
      const { ref, relations } = activeSubscriberState!;
      const root = relations.targets[ref.id];
      const target = relations.targets[targetId];
      const event = relations.events[time];
      const location = getLocationStrings(target.locations);
      const isRoot = target.id === ref.id;
      const isActive = target.startTime <= time && time <= target.endTime;
      const isSelected = event && event.target === target.id;

      return {
        root,
        target,
        event,
        location,
        isRoot,
        isActive,
        isSelected,
      };
    }
  );

export const SubscriberGraphNodeRenderer = React.forwardRef<
  NodeControl,
  NodeRendererProps<RelatedHierarchyNode>
>(function SubscriberGraphNodeRenderer({ node }, forwardedRef) {
  const elementRef = useRef<SVGGElement | null>(null);
  React.useImperativeHandle(
    forwardedRef,
    () => new DefaultNodeControl(elementRef),
    []
  );
  const theme = useTheme();
  const vm = useSelectorFunction(vmSelector, node.data.target);

  const targetColors = getTargetColors(theme, vm.target);
  const eventColors = getEventColors(theme, vm.event);

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
      <circle
        r="4"
        fill={
          vm.isActive ? targetColors.secondary : theme.palette.action.disabled
        }
      />
      {vm.isRoot && (
        <circle
          r={5}
          fill="transparent"
          stroke={
            vm.isActive
              ? targetColors.primary
              : theme.palette.action.disabledBackground
          }
        />
      )}
      {vm.isSelected && (
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
        {vm.target.name}{' '}
        <tspan fill={theme.palette.text.secondary}>#{vm.target.id}</tspan>
      </text>
      <text
        fontFamily="Monospace"
        fontStyle="oblique"
        fontSize="4"
        textAnchor="middle"
        fill={theme.palette.text.secondary}
        y="24"
      >
        {node.data.key}
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
  );
});
