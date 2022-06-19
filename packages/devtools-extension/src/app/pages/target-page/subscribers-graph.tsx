import { RelatedTarget, Relations } from '@app/protocols/insights';
import { createSelector } from '@lib/store';
import {
  activeTargetStateSelector,
  activeTargetUiStateSelector,
} from '@app/selectors/active-target-state-selector';
import { timeSelector } from '@app/selectors/insights-selectors';
import { getDoubleTree } from '@app/components/tree';
import { useSelector } from '@app/store';
import { Graph } from '@app/components/graph';
import React from 'react';
import { SubscriberGraphNodeRenderer } from '@app/pages/target-page/subscriber-graph-node-renderer';
import { SubscriberGraphLinkRenderer } from '@app/pages/target-page/subscriber-graph-link-renderer';
import { RelatedTargetHierarchyNode } from '@app/pages/target-page/related-target-hierarchy-node';

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

const hierarchyTreeSelector = createSelector(
  [activeTargetStateSelector, activeTargetUiStateSelector],
  ([activeTargetState, activeTargetUiState]) => {
    const { target, relations } = activeTargetState!;
    const { expandedKeys } = activeTargetUiState!;
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
