import React, { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { duration } from '@app/components/graph/constants';
import { Transition } from 'react-transition-group';
import { NodeData } from '@app/components/tree';
import { NodeRendererProps } from './node-renderer';
import { Renderer } from './renderer';
import { NodeControl } from './node-control';

export interface GraphNodeProps<T> {
  in?: boolean;
  node: NodeData<T>;
  nodeRenderer: Renderer<NodeRendererProps<T>, NodeControl>;
}

export function GraphNode<T>({
  in: inProp,
  node,
  nodeRenderer: NodeRenderer,
}: GraphNodeProps<T>) {
  const nodeRef = useRef<NodeControl | null>(null);
  const positionTweenRef = useRef<gsap.core.Tween | null>(null);
  const opacityTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(
    function onUpdate() {
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
    },
    [node]
  );

  const onEnter = useCallback(() => {
    opacityTweenRef.current = gsap.to(nodeRef.current!, {
      opacity: 1,
      delay: 2 * duration,
      duration,
    });
  }, []);

  const onExit = useCallback(() => {
    opacityTweenRef.current?.kill();
    opacityTweenRef.current = gsap.to(nodeRef.current!, {
      opacity: 0,
      delay: 0,
      duration,
    });
  }, []);

  return (
    <Transition<any>
      appear={true}
      mountOnEnter
      unmountOnExit
      in={inProp}
      timeout={duration * 3000}
      onEnter={onEnter}
      onExit={onExit}
    >
      <NodeRenderer node={node} ref={nodeRef} />
    </Transition>
  );
}
