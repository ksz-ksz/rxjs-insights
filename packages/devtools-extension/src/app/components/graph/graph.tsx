import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TransitionGroup } from 'react-transition-group';
import { LinkData, NodeData } from '@app/components/tree';
import { duration } from './constants';
import { GraphNode } from '@app/components/graph/graph-node';
import { NodeRendererProps } from '@app/components/graph/node-renderer';
import { Renderer } from '@app/components/graph/renderer';
import { LinkControl } from '@app/components/graph/link-control';
import { LinkRendererProps } from '@app/components/graph/link-renderer';
import { GraphLink } from '@app/components/graph/graph-link';
import { NodeControl } from './node-control';
import { initPanAndZoom } from '@app/components/graph/transform';

function getBounds(nodes: NodeData<unknown>[], focus: (number | string)[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const node of nodes) {
    if (focus.length === 0 || focus.includes(node.id)) {
      const nodeX = node.x;
      const nodeY = node.y;
      if (nodeX < minX) {
        minX = nodeX;
      }
      if (nodeX > maxX) {
        maxX = nodeX;
      }
      if (nodeY < minY) {
        minY = nodeY;
      }
      if (nodeY > maxY) {
        maxY = nodeY;
      }
    }
  }
  return { minX, maxX, minY, maxY };
}

function getViewBox(
  bounds: {
    minY: number;
    minX: number;
    maxY: number;
    maxX: number;
  },
  padding: number
) {
  const x = bounds.minX - padding;
  const y = bounds.minY - padding;
  const w = bounds.maxX - bounds.minX + 2 * padding;
  const h = bounds.maxY - bounds.minY + 2 * padding;
  return { x, y, w, h };
}

export interface GraphProps<T> {
  nodes: NodeData<T>[];
  links: LinkData<T>[];
  focus?: (number | string)[];
  nodeRenderer: Renderer<NodeRendererProps<T>, NodeControl>;
  linkRenderer: Renderer<LinkRendererProps<T>, LinkControl>;
  getNodeKey(node: NodeData<T>): number | string;
  getLinkKey(link: LinkData<T>): number | string;
  viewBoxPadding?: number;
}

export function Graph<T>({
  nodes,
  links,
  focus,
  nodeRenderer,
  linkRenderer,
  getNodeKey,
  getLinkKey,
  viewBoxPadding = 40,
}: GraphProps<T>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const initRef = useRef(false);

  useEffect(function onInit() {
    initRef.current = true;
    const vb = getViewBox(getBounds(nodes, focus ?? []), viewBoxPadding);
    const svg = svgRef.current!;
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    const subscription = initPanAndZoom(svg);

    return () => subscription.unsubscribe();
  }, []);

  useEffect(
    function onUpdate() {
      if (initRef.current) {
        const vb = getViewBox(getBounds(nodes, focus ?? []), viewBoxPadding);
        const svg = svgRef.current!;
        tweenRef.current?.kill();
        tweenRef.current = gsap.to(svg.viewBox.baseVal, {
          x: vb.x,
          y: vb.y,
          width: vb.w,
          height: vb.h,
          delay: duration,
          duration,
        });
      }
    },
    [nodes, focus]
  );

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <TransitionGroup component="g">
        {links.map((link) => (
          <GraphLink
            key={getLinkKey(link)}
            link={link}
            linkRenderer={linkRenderer}
          />
        ))}
      </TransitionGroup>

      <TransitionGroup component="g">
        {nodes.map((node) => (
          <GraphNode
            key={getNodeKey(node)}
            node={node}
            nodeRenderer={nodeRenderer}
          />
        ))}
      </TransitionGroup>
    </svg>
  );
}
