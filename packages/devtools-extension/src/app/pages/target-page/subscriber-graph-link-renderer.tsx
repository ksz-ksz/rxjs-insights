import React, { useEffect, useRef } from 'react';
import {
  DefaultLinkControl,
  LinkControl,
  LinkRendererProps,
} from '@app/components/graph';
import { Theme, useTheme } from '@mui/material';
import { useSelectorFunction } from '@app/store';
import {
  targetStateSelector,
  timeSelector,
} from '@app/selectors/insights-selectors';
import {
  getDirection,
  getEventColors,
  getTargetColors,
} from '@app/pages/target-page/subscriber-graph-utils';
import gsap from 'gsap';
import { createSelector } from '@lib/store';
import { RelatedTargetHierarchyNode } from '@app/pages/target-page/related-target-hierarchy-node';
import { getRootTargetIdFromKey } from '@app/pages/target-page/get-root-target-id';

const vmSelector = (node: RelatedTargetHierarchyNode, theme: Theme) =>
  createSelector(
    [targetStateSelector(getRootTargetIdFromKey(node.key)), timeSelector],
    ([targetState, time]) => {
      const { relations } = targetState;
      const event = relations.events[time];
      const target = relations.targets[node.target.id];
      const isSelected = event && event.target === target.id;
      const linkColor = getTargetColors(theme, target).secondary;
      const selectedColor = event && getEventColors(theme, event).secondary;

      return {
        event,
        target,
        isSelected,
        linkColor,
        selectedColor,
      };
    }
  );

export const SubscriberGraphLinkRenderer = React.forwardRef<
  LinkControl,
  LinkRendererProps<RelatedTargetHierarchyNode>
>(function LinkRenderer({ link }, forwardedRef) {
  const theme = useTheme();
  const vm = useSelectorFunction(vmSelector, link.source.data, theme);

  const elementRef = useRef<SVGPathElement | null>(null);
  React.useImperativeHandle(
    forwardedRef,
    () => new DefaultLinkControl(elementRef, 6),
    []
  );

  const tweenRef = useRef<gsap.core.Tween | null>(null);
  useEffect(() => {
    tweenRef.current?.kill();
    if (vm.isSelected) {
      const direction = getDirection(vm.event.eventType);
      tweenRef.current = gsap.fromTo(
        elementRef.current,
        { strokeDasharray: 4, strokeDashoffset: 32 * direction },
        {
          strokeDashoffset: 0,
          duration: 1,
          repeat: -1,
          ease: 'none',
        }
      );
    } else {
      gsap.set(elementRef.current, {
        strokeDasharray: 'none',
        strokeDashoffset: 0,
      });
    }
  }, [vm.isSelected && vm.event.eventType]);

  return (
    <path
      ref={elementRef}
      stroke={vm.isSelected ? vm.selectedColor : vm.linkColor}
      fill="transparent"
    />
  );
});
