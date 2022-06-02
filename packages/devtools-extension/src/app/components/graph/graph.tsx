import React, { useEffect, useMemo, useRef } from 'react';
import { usePrevious } from '@app/utils';
import { gsap } from 'gsap';
import { Transition, TransitionGroup } from 'react-transition-group';
import { linkHorizontal } from 'd3-shape';

const duration = 0.24;

function getNodeKey(node: NodeData<any>) {
  return node.id;
}

function GraphNode<T>({
  in: inProp,
  node,
}: {
  in?: boolean;
  node: NodeData<T>;
}) {
  const gRef = useRef<SVGGElement | null>(null);
  const doneRef = useRef<(() => void) | null>(null);
  const prevNode = usePrevious(node);
  useEffect(
    function onUpdate() {
      const g = gRef.current;
      if (g && prevNode) {
        gsap.fromTo(
          g,
          {
            x: prevNode.x,
            y: prevNode.y,
          },
          {
            x: node.x,
            y: node.y,
            duration: duration,
            delay: duration,
          }
        );
      }
    },
    [node]
  );
  return (
    <Transition<any>
      mountOnEnter={true}
      unmountOnExit={true}
      in={inProp}
      addEndListener={(node: any, done: () => void) => {
        doneRef.current = done;
      }}
      onEnter={() => {
        const g = gRef.current;
        gsap.fromTo(
          g,
          { opacity: 0 },
          {
            opacity: 1,
            delay: 2 * duration,
            duration,
            onComplete() {
              doneRef.current?.();
            },
            onInterrupt() {
              doneRef.current?.();
            },
          }
        );
      }}
      onExit={() => {
        const g = gRef.current;
        gsap.fromTo(g, { opacity: 1 }, { opacity: 0, delay: 0, duration });
      }}
    >
      <g ref={gRef} transform={`translate(${node.x}, ${node.y})`}>
        <circle r={10} fill="red" />
        <text fill="white">{node.id}</text>
      </g>
    </Transition>
  );
}

function getLinkKey(link: LinkData<unknown>) {
  return `${link.source.id}:${link.target.id}`;
}

interface GraphLinkProps<T> {
  in?: boolean;
  link: LinkData<T>;
}

const graphLinkHorizontal = linkHorizontal();
function GraphLink<T>({ in: inProp, link }: GraphLinkProps<T>) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const doneRef = useRef<(() => void) | null>(null);
  const prevLink = usePrevious(link);

  const d = useMemo(
    () =>
      graphLinkHorizontal({
        source: [link.source.x, link.source.y],
        target: [link.target.x, link.target.y],
      })!,
    [link]
  );

  useEffect(
    function onUpdate() {
      const path = pathRef.current;
      if (path && prevLink) {
        gsap.fromTo(
          {},
          {
            linkSourceX: prevLink.source.x,
            linkSourceY: prevLink.source.y,
            linkTargetX: prevLink.target.x,
            linkTargetY: prevLink.target.y,
          },
          {
            linkSourceX: link.source.x,
            linkSourceY: link.source.y,
            linkTargetX: link.target.x,
            linkTargetY: link.target.y,
            onUpdate() {
              const [target] = this.targets();
              const d = graphLinkHorizontal({
                source: [target.linkSourceX, target.linkSourceY],
                target: [target.linkTargetX, target.linkTargetY],
              })!;
              path.setAttribute('d', d);
            },
            duration: duration,
            delay: duration,
          }
        );
      }
    },
    [link]
  );

  return (
    <Transition<any>
      mountOnEnter={true}
      unmountOnExit={true}
      in={inProp}
      addEndListener={(node: any, done: () => void) => {
        doneRef.current = done;
      }}
      onEnter={() => {
        const path = pathRef.current;
        gsap.fromTo(
          path,
          { opacity: 0 },
          {
            opacity: 1,
            duration,
            delay: duration + duration,
            ease: 'none',
            onComplete() {
              doneRef.current?.();
            },
            onInterrupt() {
              doneRef.current?.();
            },
          }
        );
      }}
      onExit={() => {
        const path = pathRef.current;
        gsap.fromTo(
          path,
          { opacity: 1 },
          {
            opacity: 0,
            duration,
            delay: 0,
            ease: 'none',
            onComplete() {
              doneRef.current?.();
            },
            onInterrupt() {
              doneRef.current?.();
            },
          }
        );
      }}
    >
      <path ref={pathRef} d={d} stroke="green" fill="transparent" />
    </Transition>
  );
}

function getBounds(nodes: NodeData<unknown>[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const node of nodes) {
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

export interface NodeData<T> {
  id: number;
  x: number;
  y: number;
  data: T;
}

export interface LinkData<T> {
  source: NodeData<T>;
  target: NodeData<T>;
}

export interface GraphProps<T> {
  nodes: NodeData<T>[];
  links: LinkData<T>[];
  focus?: NodeData<T>[];
}

export function Graph<T>({ nodes, links, focus }: GraphProps<T>) {
  const svgRef = useRef<SVGSVGElement>(null);
  // const { nodes, links } = useMemo(
  //   () => getNodesAndLinks(treeLayout(props.rootHierarchyNode)),
  //   [props.rootHierarchyNode]
  // );
  const viewBox = useMemo(
    () => getViewBox(getBounds(focus ?? nodes), 20),
    [focus, nodes]
  );

  const prevViewBox = usePrevious(viewBox);
  useEffect(() => {
    if (svgRef.current && prevViewBox) {
      const svg = svgRef.current;
      gsap.fromTo(
        {},
        {
          x: prevViewBox.x,
          y: prevViewBox.y,
          w: prevViewBox.w,
          h: prevViewBox.h,
        },
        {
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
        }
      );
    }
  }, [viewBox]);

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      style={{
        width: '100%',
        maxHeight: '600',
      }}
    >
      <TransitionGroup component="g">
        {links.map((link) => (
          <GraphLink key={getLinkKey(link)} link={link} />
        ))}
      </TransitionGroup>

      <TransitionGroup component="g">
        {nodes.map((node) => (
          <GraphNode key={getNodeKey(node)} node={node} />
        ))}
      </TransitionGroup>
    </svg>
  );
}
