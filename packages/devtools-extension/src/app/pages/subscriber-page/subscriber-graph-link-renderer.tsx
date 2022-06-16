import React, { useEffect, useRef } from 'react';
import {
  DefaultLinkControl,
  LinkControl,
  LinkRendererProps,
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
import { createSelector } from '@lib/store';
import { activeSubscriberStateSelector } from '@app/selectors/active-target-state-selector';
import { RelatedTargetHierarchyNode } from '@app/pages/subscriber-page/related-target-hierarchy-node';

const vmSelector = (node: RelatedTargetHierarchyNode, theme: Theme) =>
  createSelector(
    [activeSubscriberStateSelector, timeSelector],
    ([activeSubscriberState, time]) => {
      const { relations } = activeSubscriberState!;
      const event = relations.events[time];
      const target = relations.targets[node.target.id];
      const isSelected = event && event.target === target.id;
      const linkColor = getTargetColors(theme, target).secondary;
      const selectedColor = event && getEventColors(theme, event).secondary;

      console.log(
        'isSelected: %o, %clinkColor: %o, %cselectedColor: %o',
        isSelected,
        `color: ${linkColor};`,
        linkColor,
        `color: ${selectedColor};`,
        selectedColor
      );

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
  }, [vm.isSelected && vm.event.eventType]);

  return (
    <path
      ref={elementRef}
      stroke={vm.isSelected ? vm.selectedColor : vm.linkColor}
      fill="transparent"
    />
  );
});
