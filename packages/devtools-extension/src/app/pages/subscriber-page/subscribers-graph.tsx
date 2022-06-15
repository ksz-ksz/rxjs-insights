import {
  RelatedHierarchyNode,
  RelatedTarget,
  Relations,
} from '@app/protocols/insights';
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

function isExpanded(expanded: Set<string>, data: RelatedHierarchyNode) {
  return expanded.has(data.key);
}

function getActiveChildren(
  target: RelatedTarget,
  data: RelatedHierarchyNode,
  relations: Relations,
  time: number,
  expanded: Set<string>
) {
  return isActive(time, target)
    ? data.children.filter(
        (child) =>
          isActive(time, relations.targets[child.target]) &&
          isExpanded(expanded, child)
      )
    : [];
}

function getRelatedHierarchyNode(
  relations: Relations,
  relation: 'sources' | 'destinations',
  target: number,
  parentKey?: string
): RelatedHierarchyNode {
  const key = parentKey ? `${parentKey}.${target}` : `${target}`;
  return {
    key,
    target,
    children: relations.targets[target][relation]!.map((childTarget) =>
      getRelatedHierarchyNode(relations, relation, childTarget, key)
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
      getRelatedHierarchyNode(relations, 'sources', ref.id),
      getRelatedHierarchyNode(relations, 'destinations', ref.id),
      (data) => data.key,
      (data) => getActiveChildren(target, data, relations, time, visibleKeys)
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
