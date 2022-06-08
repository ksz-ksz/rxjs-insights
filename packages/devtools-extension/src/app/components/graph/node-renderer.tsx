import { NodeData } from '@app/components/tree';
import React, { useRef } from 'react';
import {
  DefaultNodeControl,
  NodeControl,
} from '@app/components/graph/node-control';

export type NodeRendererProps<T> = { node: NodeData<T> };

export const DefaultNodeRenderer = React.forwardRef<
  NodeControl,
  NodeRendererProps<any>
>(function DefaultNodeRenderer(props, forwardedRef) {
  const elementRef = useRef<SVGGElement | null>(null);
  React.useImperativeHandle(
    forwardedRef,
    () => new DefaultNodeControl(elementRef),
    []
  );

  return (
    <g ref={elementRef}>
      <circle r={10} fill="red" />
      <text y="6" textAnchor="middle" fill="white">
        {props.node.id}
      </text>
    </g>
  );
});
