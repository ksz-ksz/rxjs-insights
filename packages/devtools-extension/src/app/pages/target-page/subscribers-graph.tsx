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
import { dashboardActions } from '@app/actions/dashboad-actions';
import { CenterFocusStrong, Close, CropFree } from '@mui/icons-material';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';

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
  relation: 'sources' | 'destinations',
  key: string,
  visibleKeys: Set<string>,
  relations: Relations
) {
  const visibleChildren: RelatedTargetHierarchyNode[] = [];
  for (const childTarget of target[relation]!) {
    const childKey = `${key}.${childTarget}`;
    if (isKeyVisible(visibleKeys, childKey)) {
      visibleChildren.push(
        getRelatedHierarchyNode(
          relations,
          relation,
          relations.targets[childTarget],
          childKey,
          visibleKeys
        )
      );
    }
  }
  return visibleChildren;
}

function getNodeType(
  root: boolean,
  relation: 'sources' | 'destinations'
): 'root' | 'source' | 'destination' {
  if (root) {
    return 'root';
  } else {
    switch (relation) {
      case 'sources':
        return 'source';
      case 'destinations':
        return 'destination';
    }
  }
}

function getRelatedHierarchyNode(
  relations: Relations,
  relation: 'sources' | 'destinations',
  target: RelatedTarget,
  key: string,
  visibleKeys: Set<string>
): RelatedTargetHierarchyNode {
  return {
    key,
    target,
    children: getVisibleChildren(target, relation, key, visibleKeys, relations),
  };
}

function getVisibleKeysVisitor(
  target: RelatedTarget,
  targetKey: string,
  relations: Relations,
  relation: 'sources' | 'destinations',
  expandedKeys: Set<string>,
  visibleKeys: Set<string>
) {
  visibleKeys.add(targetKey);
  if (expandedKeys.has(targetKey)) {
    for (const childId of target[relation]!) {
      const childTarget = relations.targets[childId];
      const childTargetKey = `${targetKey}.${childId}`;
      getVisibleKeysVisitor(
        childTarget,
        childTargetKey,
        relations,
        relation,
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
    String(root.id),
    relations,
    'sources',
    expandedKeys,
    visibleKeys
  );
  getVisibleKeysVisitor(
    root,
    String(root.id),
    relations,
    'destinations',
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
      'sources',
      target,
      String(target.id),
      visibleKeys
    );
    const destinations = getRelatedHierarchyNode(
      relations,
      'destinations',
      target,
      String(target.id),
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
  [hierarchyTreeSelector, timeSelector, followingSelector],
  ([hierarchyTree, time, following]) => {
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
