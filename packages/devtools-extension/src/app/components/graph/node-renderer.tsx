import { NodeData } from '@app/components/tree';
import React from 'react';

export type NodeRendererProps<T> = { node: NodeData<T> };

export function DefaultNodeRenderer({ node }: NodeRendererProps<unknown>) {
  return (
    <>
      <circle r={10} fill="red" />
      <text y="6" textAnchor="middle" fill="white">
        {node.id}
      </text>
    </>
  );
}
