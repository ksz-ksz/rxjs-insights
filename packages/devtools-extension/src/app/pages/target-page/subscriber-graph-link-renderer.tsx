import React, { useEffect, useRef } from 'react';
import {
  DefaultLinkControl,
  LinkControl,
  LinkRendererProps,
} from '@app/components/graph';
import { Theme, useTheme } from '@mui/material';
import { targetStateSelector } from '@app/selectors/insights-selectors';
import {
  getDirection,
  getEventColors,
  getTargetColors,
} from '@app/pages/target-page/subscriber-graph-utils';
import gsap from 'gsap';
import { RelatedTargetHierarchyNode } from '@app/pages/target-page/related-target-hierarchy-node';
import { getRootTargetIdFromKey } from '@app/pages/target-page/get-root-target-id';
import { timeSelector } from '@app/selectors/time-selectors';
import { createSelector, SelectorContextFromDeps } from '@lib/state-fx/store';
import { useSelector } from '@lib/state-fx/store-react';
import { activeTargetState } from '@app/selectors/active-target-state-selector';

const vmSelector = createSelector(
  (
    context: SelectorContextFromDeps<
      [typeof targetStateSelector, typeof timeSelector]
    >,
    node: RelatedTargetHierarchyNode,
    theme: Theme
  ) => {
    const targetState = targetStateSelector(
      context,
      getRootTargetIdFromKey(node.key)
    );
    const time = timeSelector(context);
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
  const vm = useSelector(
    activeTargetState,
    vmSelector,
    link.source.data,
    theme
  );

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
