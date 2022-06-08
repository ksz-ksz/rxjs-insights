import React, { JSXElementConstructor, useEffect, useRef } from 'react';
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

function getNodeKey(node: NodeData<any>) {
  return node.id;
}

function getLinkKey(link: LinkData<unknown>) {
  return `${link.source.id}:${link.target.id}`;
}

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
  nodeRenderer?: Renderer<NodeRendererProps<T>, NodeControl>;
  linkRenderer?: Renderer<LinkRendererProps<T>, LinkControl>;
}

export function Graph<T>({
  nodes,
  links,
  focus,
  nodeRenderer,
  linkRenderer,
}: GraphProps<T>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const initRef = useRef(false);
  const viewBoxCoordsRef = useRef({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  useEffect(function onInit() {
    initRef.current = true;
    const viewBox = getViewBox(getBounds(nodes, focus ?? []), 20);
    const svg = svgRef.current!;
    svg.setAttribute(
      'viewBox',
      `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`
    );
  }, []);

  useEffect(
    function onUpdate() {
      if (initRef.current) {
        const viewBox = getViewBox(getBounds(nodes, focus ?? []), 20);
        const svg = svgRef.current!;
        tweenRef.current?.kill();
        tweenRef.current = gsap.to(viewBoxCoordsRef.current, {
          x: viewBox.x,
          y: viewBox.y,
          w: viewBox.w,
          h: viewBox.h,
          delay: duration,
          duration,
          onUpdate() {
            const [target] = this.targets();
            svg.setAttribute(
              'viewBox',
              `${target.x} ${target.y} ${target.w} ${target.h}`
            );
          },
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
