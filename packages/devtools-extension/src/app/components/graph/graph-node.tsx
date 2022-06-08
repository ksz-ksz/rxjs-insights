import React, { JSXElementConstructor, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePrevious } from '@app/utils';
import { duration } from '@app/components/graph/constants';
import { Transition } from 'react-transition-group';
import { NodeData } from '@app/components/tree';
import {
  DefaultNodeRenderer,
  NodeRendererProps,
} from '@app/components/graph/node-renderer';

export interface GraphNodeProps<T> {
  in?: boolean;
  node: NodeData<T>;
  nodeRenderer?: JSXElementConstructor<NodeRendererProps<T>>;
}

export function GraphNode<T>({
  in: inProp,
  node,
  nodeRenderer = DefaultNodeRenderer,
}: GraphNodeProps<T>) {
  const gRef = useRef<SVGGElement | null>(null);
  const doneRef = useRef<(() => void) | null>(null);
  const updateTweenRef = useRef<gsap.core.Tween | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const prevNode = usePrevious(node);

  useEffect(function onInit() {
    const g = gRef.current!;
    g.setAttribute('opacity', '0');
    g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
  }, []);

  useEffect(
    function onUpdate() {
      if (inProp && prevNode) {
        const g = gRef.current!;
        updateTweenRef.current?.kill();
        updateTweenRef.current = gsap.to(g, {
          x: node.x,
          y: node.y,
          duration: duration,
          delay: duration,
        });
      }
    },
    [node]
  );

  const NodeRenderer = nodeRenderer;

  return (
    <Transition<any>
      appear={true}
      in={inProp}
      addEndListener={(node: any, done: () => void) => {
        doneRef.current = done;
      }}
      onEnter={() => {
        const g = gRef.current!;
        tweenRef.current = gsap.to(g, {
          opacity: 1,
          delay: 2 * duration,
          duration,
          onComplete() {
            doneRef.current?.();
          },
          onInterrupt() {
            doneRef.current?.();
          },
        });
      }}
      onExit={() => {
        const g = gRef.current;
        tweenRef.current?.kill();
        tweenRef.current = gsap.to(g, { opacity: 0, delay: 0, duration });
      }}
    >
      <g ref={gRef}>
        <NodeRenderer node={node} />
      </g>
    </Transition>
  );
}
