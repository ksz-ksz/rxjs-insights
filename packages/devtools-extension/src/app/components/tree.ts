import { hierarchy, HierarchyPointNode, tree } from 'd3-hierarchy';

export interface NodeData<T> {
  id: number | string;
  x: number;
  y: number;
  data: T;
}

export interface LinkData<T> {
  source: NodeData<T>;
  target: NodeData<T>;
}

export interface TreeData<T> {
  nodes: NodeData<T>[];
  links: LinkData<T>[];
}

const treeLayout = tree<any>().nodeSize([40, 80]);

function visitNodesAndLinks<T>(
  node: HierarchyPointNode<T>,
  nodes: Record<number | string, NodeData<T>>,
  links: [number | string, number | string][],
  getId: (data: T) => number | string,
  getX: (x: number, y: number) => number,
  getY: (x: number, y: number) => number
) {
  const id = getId(node.data);
  nodes[id] = {
    id,
    x: getX(node.x, node.y),
    y: getY(node.x, node.y),
    data: node.data,
  };
  for (let link of node.links()) {
    if (link.source === node) {
      links.push([id, getId(link.target.data)]);
      visitNodesAndLinks(link.target, nodes, links, getId, getX, getY);
    }
  }
}

export function getTree<T>(
  root: T,
  getId: (data: T) => number | string,
  getChildren: (data: T) => T[],
  getX: (x: number, y: number) => number = (x, y) => y,
  getY: (x: number, y: number) => number = (x, y) => x
): TreeData<T> {
  const nodesIndex: Record<number | string, NodeData<T>> = {};
  const linkConnections: [number | string, number | string][] = [];

  visitNodesAndLinks(
    treeLayout(hierarchy<T>(root, getChildren)),
    nodesIndex,
    linkConnections,
    getId,
    getX,
    getY
  );

  const nodes = Object.values(nodesIndex);
  const links = linkConnections.map(
    ([sourceId, targetId]): LinkData<T> => ({
      source: nodesIndex[sourceId],
      target: nodesIndex[targetId],
    })
  );

  return { nodes, links };
}

export function getDoubleTree<T>(
  rootA: T,
  rootB: T,
  getId: (data: T) => number | string,
  getChildren: (data: T) => T[]
): TreeData<T> {
  const {
    nodes: [, ...nodesA],
    links: linksA,
  } = getTree(
    rootA,
    getId,
    getChildren,
    (x, y) => -y,
    (x, y) => x
  );
  const { nodes: nodesB, links: linksB } = getTree(
    rootB,
    getId,
    getChildren,
    (x, y) => y,
    (x, y) => x
  );
  return {
    nodes: [...nodesA, ...nodesB],
    links: [...linksA, ...linksB],
  };
}
