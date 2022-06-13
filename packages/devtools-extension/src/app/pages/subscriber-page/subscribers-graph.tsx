import {
  RelatedHierarchyNode,
  RelatedTarget,
  Relations,
} from '@app/protocols/insights';
import { createSelector } from '@lib/store';
import { activeSubscriberStateSelector } from '@app/selectors/active-target-state-selector';
import { timeSelector } from '@app/selectors/insights-selectors';
import { getDoubleTree } from '@app/components/tree';
import { useSelector } from '@app/store';
import { Graph } from '@app/components/graph';
import React from 'react';
import { SubscriberGraphNodeRenderer } from '@app/pages/subscriber-page/subscriber-graph-node-renderer';
import { SubscriberGraphLinkRenderer } from '@app/pages/subscriber-page/subscriber-graph-link-renderer';

function getActiveChildren(
  target: RelatedTarget,
  data: RelatedHierarchyNode,
  relations: Relations,
  time: number
) {
  return isActive(time, target)
    ? data.children.filter((child) =>
        isActive(time, relations.targets[child.target])
      )
    : [];
}

const vmSelector = createSelector(
  [activeSubscriberStateSelector, timeSelector],
  ([activeSubscriberState, time]) => {
    const { ref, relations, hierarchy } = activeSubscriberState!;
    const target = relations.targets[ref.id];
    const { nodes, links } = getDoubleTree(
      hierarchy.sources,
      hierarchy.destinations,
      (data, path) =>
        [...path, data].map((x: RelatedHierarchyNode) => x.target).join('/'),
      (data) => getActiveChildren(target, data, relations, time)
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
