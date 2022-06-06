import React, { useMemo } from 'react';
import { useSelector } from '@app/store';
import { subscriberState } from '@app/selectors/insights-selectors';
import { RefOutlet } from '@app/components/ref-outlet';
import { Scrollable } from '@app/components/scrollable';
import { Container } from '@mui/material';
import { Graph, NodeRendererProps } from '@app/components/graph';
import {
  RelatedHierarchyNode,
  Relations,
  TargetId,
} from '@app/protocols/insights';
import { getDoubleTree } from '@app/components/tree';

function getTarget(relations: Relations, target: TargetId) {
  switch (target.type) {
    case 'subscriber':
      return relations.subscribers[target.id];
    case 'observable':
      return relations.observables[target.id];
  }
}

function getNodeRenderer(relations: Relations) {
  return function NodeRenderer({
    node,
  }: NodeRendererProps<RelatedHierarchyNode>) {
    const target = getTarget(relations, node.data.target);
    return (
      <>
        <circle r="6" fill="green" />
        <text fontSize="6" y="12" textAnchor="middle" fill="white">
          {target.name}#{target.id}
        </text>
      </>
    );
  };
}

export function SubscriberPage() {
  const state = useSelector(subscriberState);
  const NodeRenderer = useMemo(
    () => (state ? getNodeRenderer(state.relations) : undefined),
    [state]
  );
  const { nodes, links } = useMemo(
    () =>
      state
        ? getDoubleTree(
            state.hierarchy.sources,
            state.hierarchy.destinations,
            (data) => data.target.id,
            (data) => data.children
          )
        : { nodes: [], links: [] },
    [state]
  );
  const ref = state?.ref;
  if (ref) {
    return (
      <Scrollable>
        <Container>
          <RefOutlet reference={ref} />
          <Graph nodes={nodes} links={links} nodeRenderer={NodeRenderer} />
        </Container>
      </Scrollable>
    );
  } else {
    return null;
  }
}
