import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePrevious } from '@app/utils';
import { duration } from '@app/components/graph/constants';
import { Transition } from 'react-transition-group';
import { NodeData } from '@app/components/tree';
import { DefaultNodeRenderer, NodeRendererProps } from './node-renderer';
import { Renderer } from './renderer';
import { NodeControl } from './node-control';

export interface GraphNodeProps<T> {
  in?: boolean;
  node: NodeData<T>;
  nodeRenderer?: Renderer<NodeRendererProps<T>, NodeControl>;
}

export function GraphNode<T>({
  in: inProp,
  node,
  nodeRenderer = DefaultNodeRenderer,
}: GraphNodeProps<T>) {
  const initRef = useRef(true);
  const nodeRef = useRef<NodeControl | null>(null);
  const doneRef = useRef<(() => void) | null>(null);
  const positionTweenRef = useRef<gsap.core.Tween | null>(null);
  const opacityTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(
    function onUpdate() {
      if (initRef.current) {
        initRef.current = false;
        nodeRef.current!.opacity = 0;
        nodeRef.current!.position = { x: node.x, y: node.y };
      } else if (inProp) {
        positionTweenRef.current?.kill();
        positionTweenRef.current = gsap.to(
          { ...nodeRef.current!.position },
          {
            x: node.x,
            y: node.y,
            onUpdate() {
              const [target] = this.targets();
              nodeRef.current!.position = {
                x: target.x,
                y: target.y,
              };
            },
            duration: duration,
            delay: duration,
          }
        );
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
        opacityTweenRef.current = gsap.to(nodeRef.current!, {
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
        opacityTweenRef.current?.kill();
        opacityTweenRef.current = gsap.to(nodeRef.current!, {
          opacity: 0,
          delay: 0,
          duration,
        });
      }}
    >
      <NodeRenderer node={node} ref={nodeRef} />
    </Transition>
  );
}
