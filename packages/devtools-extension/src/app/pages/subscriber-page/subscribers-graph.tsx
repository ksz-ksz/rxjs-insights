import { RelatedTarget, Relations } from '@app/protocols/insights';
import { createSelector } from '@lib/store';
import {
  activeSubscriberStateSelector,
  activeSubscriberUiStateSelector,
} from '@app/selectors/active-target-state-selector';
import { timeSelector } from '@app/selectors/insights-selectors';
import { getDoubleTree } from '@app/components/tree';
import { useSelector } from '@app/store';
import { Graph } from '@app/components/graph';
import React from 'react';
import { SubscriberGraphNodeRenderer } from '@app/pages/subscriber-page/subscriber-graph-node-renderer';
import { SubscriberGraphLinkRenderer } from '@app/pages/subscriber-page/subscriber-graph-link-renderer';
import { RelatedTargetHierarchyNode } from '@app/pages/subscriber-page/related-target-hierarchy-node';
import { setRef } from '@mui/material';

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
  visibleKeys: Set<string>,
  root = false
): RelatedTargetHierarchyNode {
  return {
    key,
    target,
    type: getNodeType(root, relation),
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

const hierarchyTreeSelector = createSelector(
  [activeSubscriberStateSelector, activeSubscriberUiStateSelector],
  ([activeSubscriberState, activeSubscriberUiState]) => {
    const { ref, relations } = activeSubscriberState!;
    const { expandedKeys } = activeSubscriberUiState!;
    const target = relations.targets[ref.id];
    const visibleKeys = getVisibleKeys(target, relations, expandedKeys);
    const sources = getRelatedHierarchyNode(
      relations,
      'sources',
      target,
      String(target.id),
      visibleKeys,
      true
    );
    const destinations = getRelatedHierarchyNode(
      relations,
      'destinations',
      target,
      String(target.id),
      visibleKeys,
      true
    );

    return { target, sources, destinations };
  }
);

const vmSelector = createSelector(
  [hierarchyTreeSelector, timeSelector],
  ([hierarchyTree, time]) => {
    const { target, sources, destinations } = hierarchyTree;
    const { nodes, links } = getDoubleTree(
      sources,
      destinations,
      (node) => node.key,
      (node) => getActiveChildren(node, time)
    );

    return {
      key: target.id,
      nodes,
      links,
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

  return (
    <Graph
      key={vm.key}
      nodes={vm.nodes}
      links={vm.links}
      nodeRenderer={SubscriberGraphNodeRenderer}
      linkRenderer={SubscriberGraphLinkRenderer}
    />
  );
}
