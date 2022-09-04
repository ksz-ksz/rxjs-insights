import {
  RelatedEvent,
  RelatedTarget,
  Relations,
} from '@app/protocols/insights';
import { createSelector, useDispatchCallback } from '@lib/store';
import {
  activeTargetStateSelector,
  activeTargetUiStateSelector,
} from '@app/selectors/active-target-state-selector';
import {
  followingSelector,
  showExcludedEventsSelector,
  timeSelector,
} from '@app/selectors/insights-selectors';
import { getDoubleTree, LinkData, NodeData } from '@app/components/tree';
import { useSelector } from '@app/store';
import { Graph } from '@app/components/graph';
import React from 'react';
import { SubscriberGraphNodeRenderer } from '@app/pages/target-page/subscriber-graph-node-renderer';
import { SubscriberGraphLinkRenderer } from '@app/pages/target-page/subscriber-graph-link-renderer';
import { RelatedTargetHierarchyNode } from '@app/pages/target-page/related-target-hierarchy-node';
import { Box, IconButton } from '@mui/material';
import {
  CenterFocusStrong,
  CropFree,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';
import {
  getDestinationChildKey,
  getDestinationChildren,
  getSourceChildKey,
  getSourceChildren,
} from '@app/utils/related-children';

function isKeyVisible(visibleKeys: Set<string>, key: string) {
  return visibleKeys.has(key);
}

function getActiveChildren(node: RelatedTargetHierarchyNode, time: number) {
  return isTargetActive(time, node.target)
    ? node.children.filter((child) => isTargetActive(time, child.target))
    : [];
}

function getVisibleChildren(
  target: RelatedTarget,
  getChildren: (target: RelatedTarget) => number[],
  getChildKey: (childId: number, parentKey: string) => string,
  key: string,
  visibleKeys: Set<string>,
  relations: Relations
) {
  const visibleChildren: RelatedTargetHierarchyNode[] = [];
  for (const childId of getChildren(target)) {
    const childKey = getChildKey(childId, key);
    if (isKeyVisible(visibleKeys, childKey)) {
      visibleChildren.push(
        getRelatedHierarchyNode(
          relations,
          getChildren,
          getChildKey,
          relations.targets[childId],
          childKey,
          visibleKeys
        )
      );
    }
  }
  return visibleChildren;
}

function getRelatedHierarchyNode(
  relations: Relations,
  getChildren: (target: RelatedTarget) => number[],
  getChildKey: (childId: number, parentKey: string) => string,
  target: RelatedTarget,
  key: string,
  visibleKeys: Set<string>
): RelatedTargetHierarchyNode {
  return {
    key,
    target,
    children: getVisibleChildren(
      target,
      getChildren,
      getChildKey,
      key,
      visibleKeys,
      relations
    ),
  };
}

function getVisibleKeysVisitor(
  target: RelatedTarget,
  targetKey: string,
  relations: Relations,
  getChildren: (target: RelatedTarget) => number[],
  getChildKey: (childId: number, parentKey: string) => string,
  expandedKeys: Set<string>,
  visibleKeys: Set<string>
) {
  visibleKeys.add(targetKey);
  if (expandedKeys.has(targetKey)) {
    for (const childId of getChildren(target)) {
      const childTarget = relations.targets[childId];
      const childTargetKey = getChildKey(childId, targetKey);
      getVisibleKeysVisitor(
        childTarget,
        childTargetKey,
        relations,
        getChildren,
        getChildKey,
        expandedKeys,
        visibleKeys
      );
    }
  }
}

function getVisibleKeys(
  root: RelatedTarget,
  relations: Relations,
  expandedKeys: Set<string>
): Set<string> {
  const visibleKeys = new Set<string>();
  getVisibleKeysVisitor(
    root,
    `<${root.id}>`,
    relations,
    getSourceChildren,
    getSourceChildKey,
    expandedKeys,
    visibleKeys
  );
  getVisibleKeysVisitor(
    root,
    `<${root.id}>`,
    relations,
    getDestinationChildren,
    getDestinationChildKey,
    expandedKeys,
    visibleKeys
  );
  return visibleKeys;
}

function getFocus(
  nodes: NodeData<RelatedTargetHierarchyNode>[],
  event: RelatedEvent
) {
  return nodes
    .filter((x) => x.data.target.id === event.target)
    .map((x) => x.id);
}

function getViewBoxPadding(focus: (number | string)[]) {
  return focus.length === 0 ? 40 : 100;
}

const hierarchyTreeSelector = createSelector(
  [activeTargetStateSelector, activeTargetUiStateSelector],
  ([activeTargetState, activeTargetUiState]) => {
    const { target, relations } = activeTargetState!;
    const { expandedKeys, keysMapping } = activeTargetUiState!;
    const visibleKeys = getVisibleKeys(target, relations, expandedKeys);
    const sources = getRelatedHierarchyNode(
      relations,
      getSourceChildren,
      getSourceChildKey,
      target,
      `<${target.id}>`,
      visibleKeys
    );
    const destinations = getRelatedHierarchyNode(
      relations,
      getDestinationChildren,
      getDestinationChildKey,
      target,
      `<${target.id}>`,
      visibleKeys
    );
    const getNodeKey = (node: NodeData<RelatedTargetHierarchyNode>) =>
      keysMapping[node.data.key];
    const getLinkKey = (link: LinkData<RelatedTargetHierarchyNode>) =>
      `${keysMapping[link.source.data.key]}:${
        keysMapping[link.target.data.key]
      }`;
    return { relations, target, sources, destinations, getNodeKey, getLinkKey };
  }
);

const vmSelector = createSelector(
  [
    hierarchyTreeSelector,
    timeSelector,
    followingSelector,
    showExcludedEventsSelector,
  ],
  ([hierarchyTree, time, following, showExcludedEvents]) => {
    const { relations, target, sources, destinations, getNodeKey, getLinkKey } =
      hierarchyTree;
    const { nodes, links } = getDoubleTree(
      sources,
      destinations,
      (node) => node.key,
      (node) => getActiveChildren(node, time)
    );

    const event = relations.events[time];
    const focus = following && event ? getFocus(nodes, event) : [];
    const viewBoxPadding = getViewBoxPadding(focus);

    return {
      key: target.id,
      nodes,
      links,
      getNodeKey,
      getLinkKey,
      following,
      showExcludedEvents,
      focus,
      viewBoxPadding,
    };
  }
);

function isTargetActive(time: number, target: RelatedTarget) {
  return (
    time !== undefined && time >= target.startTime && time <= target.endTime
  );
}

export function SubscribersGraph() {
  const vm = useSelector(vmSelector);
  const onFollowChange = useDispatchCallback(
    () =>
      vm.following
        ? subscribersGraphActions.UnfollowEvent()
        : subscribersGraphActions.FollowEvent(),
    [vm.following]
  );
  const onShowExcludedChange = useDispatchCallback(
    () =>
      vm.showExcludedEvents
        ? subscribersGraphActions.HideExcludedEvents()
        : subscribersGraphActions.ShowExcludedEvents(),
    [vm.showExcludedEvents]
  );

  return (
    <Box sx={{ position: 'relative', flexGrow: 1, flexShrink: 1, height: 0 }}>
      <Graph
        nodes={vm.nodes}
        links={vm.links}
        focus={vm.focus}
        nodeRenderer={SubscriberGraphNodeRenderer}
        linkRenderer={SubscriberGraphLinkRenderer}
        getNodeKey={vm.getNodeKey}
        getLinkKey={vm.getLinkKey}
        viewBoxPadding={vm.viewBoxPadding}
      />
      <IconButton
        size="small"
        sx={{ position: 'absolute', bottom: 2, left: 2 }}
        onClick={onShowExcludedChange}
      >
        {vm.showExcludedEvents ? (
          <Visibility titleAccess="Excluded entries are visible. Click to hide them." />
        ) : (
          <VisibilityOff titleAccess="Excluded entries are not visible. Click to show them." />
        )}
      </IconButton>

      <IconButton
        size="small"
        sx={{ position: 'absolute', bottom: 2, right: 2 }}
        onClick={onFollowChange}
      >
        {vm.following ? (
          <CenterFocusStrong titleAccess="Following events is enabled. Click to disable." />
        ) : (
          <CropFree titleAccess="Following events is disabled. Click to enable." />
        )}
      </IconButton>
    </Box>
  );
}
