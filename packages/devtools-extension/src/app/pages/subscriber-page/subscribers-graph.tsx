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

function isKeyVisible(visibleKeys: Set<string>, key: string) {
  return visibleKeys.has(key);
}

function getActiveChildren(
  node: RelatedTargetHierarchyNode,
  time: number,
  visibleKeys: Set<string>
) {
  return isTargetActive(time, node.target)
    ? node.children.filter(
        (child) =>
          isTargetActive(time, child.target) &&
          isKeyVisible(visibleKeys, child.key)
      )
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

const vmSelector = createSelector(
  [
    activeSubscriberStateSelector,
    activeSubscriberUiStateSelector,
    timeSelector,
  ],
  ([activeSubscriberState, activeSubscriberUiState, time]) => {
    const { ref, relations } = activeSubscriberState!;
    const { visibleKeys } = activeSubscriberUiState!;
    const target = relations.targets[ref.id];
    const { nodes, links } = getDoubleTree(
      getRelatedHierarchyNode(
        relations,
        'sources',
        target,
        String(target.id),
        visibleKeys
      ),
      getRelatedHierarchyNode(
        relations,
        'destinations',
        target,
        String(target.id),
        visibleKeys
      ),
      (node) => node.key,
      (node) => getActiveChildren(node, time, visibleKeys)
    );

    return {
      key: ref.id,
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
