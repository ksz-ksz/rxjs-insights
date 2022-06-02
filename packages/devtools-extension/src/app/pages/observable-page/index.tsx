import React, { useMemo, useState } from 'react';
import { useSelector } from '@app/store';
import { observableInfo } from '@app/selectors/insights-selectors';
import { RefOutlet } from '@app/components/ref-outlet';
import { Scrollable } from '@app/components/scrollable';
import { Container } from '@mui/material';

import {
  hierarchy,
  HierarchyNode,
  HierarchyPointNode,
  tree,
} from 'd3-hierarchy';
import { Graph, LinkData, NodeData } from '@app/components/graph/graph';

const rootHierarchyNodeA = hierarchy({
  name: 'A',
  children: [
    { name: 'B', children: [{ name: 'D' }, { name: 'E' }] },
    {
      name: 'C',
      children: [
        { name: 'F' },
        { name: 'G' },
        {
          name: 'H',
          children: [{ name: 'I', children: [{ name: 'J' }] }, { name: 'K' }],
        },
      ],
    },
  ],
});

const rootHierarchyNodeB = hierarchy({
  name: 'A',
  children: [
    { name: 'B', children: [{ name: 'D' }, { name: 'E' }, { name: 'X' }] },
    {
      name: 'C',
      children: [
        { name: 'F' },
        {
          name: 'H',
          children: [{ name: 'I' }, { name: 'K' }],
        },
        { name: 'R', children: [{ name: 'Q' }, { name: 'P' }] },
      ],
    },
  ],
});

const rootHierarchyNodeA1 = hierarchy({
  name: 'A',
  children: [{ name: 'B', children: [{ name: 'E' }] }, { name: 'Y' }],
});

const rootHierarchyNodeB1 = hierarchy({
  name: 'A',
  children: [{ name: 'B', children: [{ name: 'D' }, { name: 'X' }] }],
});

const roots = [
  // rootHierarchyNodeA,
  // rootHierarchyNodeB,
  rootHierarchyNodeA1,
  rootHierarchyNodeB1,
];

const treeLayout = tree<{ name: string }>().nodeSize([40, 80]);

function visitNodesAndLinks<T extends { name: string } = { name: string }>(
  hierarchy: HierarchyPointNode<T>,
  nodes: Record<number, NodeData<T>>,
  links: [number, number][]
) {
  const id = hierarchy.data.name.charCodeAt(0);
  nodes[id] = {
    id,
    x: hierarchy.y,
    y: hierarchy.x,
    data: hierarchy.data,
  };
  for (let link of hierarchy.links()) {
    if (link.source === hierarchy) {
      links.push([id, link.target.data.name.charCodeAt(0)]);
      visitNodesAndLinks(link.target, nodes, links);
    }
  }
}

function getNodesAndLinks<T extends { name: string } = { name: string }>(
  root: HierarchyNode<T>
) {
  const nodesIndex: Record<number, NodeData<T>> = {};
  const linkConnections: [number, number][] = [];

  visitNodesAndLinks(treeLayout(root), nodesIndex, linkConnections);

  const nodes = Object.values(nodesIndex);
  const links = linkConnections.map(
    ([sourceId, targetId]): LinkData<T> => ({
      source: nodesIndex[sourceId],
      target: nodesIndex[targetId],
    })
  );

  return { nodes, links };
}

export function ObservablePage() {
  const info = useSelector(observableInfo);
  const [rootIndex, setRootIndex] = useState(0);
  const { nodes, links } = useMemo(
    () => getNodesAndLinks(roots[rootIndex]),
    [rootIndex]
  );
  if (info) {
    return (
      <Scrollable>
        <Container>
          <button onClick={() => setRootIndex((rootIndex + 1) % roots.length)}>
            Switch root
          </button>
          <RefOutlet reference={info.target} />
          <Graph nodes={nodes} links={links} />
        </Container>
      </Scrollable>
    );
  } else {
    return null;
  }
}
