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

function isExpanded(expanded: Set<string>, data: RelatedTargetHierarchyNode) {
  return expanded.has(data.key);
}

function getActiveChildren(
  target: RelatedTarget,
  data: RelatedTargetHierarchyNode,
  time: number,
  expanded: Set<string>
) {
  return isActive(time, target)
    ? data.children.filter(
        (child) => isActive(time, child.target) && isExpanded(expanded, child)
      )
    : [];
}

function getRelatedHierarchyNode(
  relations: Relations,
  relation: 'sources' | 'destinations',
  target: RelatedTarget,
  parentKey?: string
): RelatedTargetHierarchyNode {
  const key = parentKey ? `${parentKey}.${target.id}` : `${target.id}`;
  return {
    key,
    target,
    children: target[relation]!.map((childTarget) =>
      getRelatedHierarchyNode(
        relations,
        relation,
        relations.targets[childTarget],
        key
      )
    ),
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
      getRelatedHierarchyNode(relations, 'sources', target),
      getRelatedHierarchyNode(relations, 'destinations', target),
      (data) => data.key,
      (data) => getActiveChildren(target, data, time, visibleKeys)
    );

    return {
      key: ref.id,
      nodes,
      links,
    };
  }
);

function isActive(time: number, target: RelatedTarget) {
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
