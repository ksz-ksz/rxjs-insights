import React, {
  JSXElementConstructor,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { usePrevious } from '@app/utils';
import gsap from 'gsap';
import { Transition, TransitionGroup } from 'react-transition-group';
import { linkHorizontal } from 'd3-shape';

const duration = 0.24;

function getNodeKey(node: NodeData<any>) {
  return node.id;
}

interface GraphNodeProps<T> {
  in?: boolean;
  node: NodeData<T>;
  nodeRenderer?: JSXElementConstructor<NodeRendererProps<T>>;
}

export type NodeRendererProps<T> = { node: NodeData<T> };

function defaultNodeRenderer({ node }: NodeRendererProps<unknown>) {
  return (
    <>
      <circle r={10} fill="red" />
      <text y="6" textAnchor="middle" fill="white">
        {node.id}
      </text>
    </>
  );
}

function GraphNode<T>({
  in: inProp,
  node,
  nodeRenderer = defaultNodeRenderer,
}: GraphNodeProps<T>) {
  const gRef = useRef<SVGGElement | null>(null);
  const doneRef = useRef<(() => void) | null>(null);
  const updateTweenRef = useRef<gsap.core.Tween | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const prevNode = usePrevious(node);

  useEffect(function onInit() {
    console.log('node.onInit', getNodeKey(node));
    const g = gRef.current!;
    g.setAttribute('opacity', '0');
    g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
  }, []);

  useEffect(
    function onUpdate() {
      if (inProp && prevNode) {
        console.log('node.onUpdate', getNodeKey(node));
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
      // mountOnEnter={true}
      // unmountOnExit={true}
      in={inProp}
      addEndListener={(node: any, done: () => void) => {
        doneRef.current = done;
      }}
      onEnter={() => {
        console.log('node.onEnter', getNodeKey(node));
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
        console.log('node.onExit', getNodeKey(node));
        const g = gRef.current;
        tweenRef.current?.kill();
        tweenRef.current = gsap.to(g, { opacity: 0, delay: 0, duration });
      }}
    >
      <g data-key={getNodeKey(node)} ref={gRef}>
        <NodeRenderer node={node} />
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
  const pathCoordsRef = useRef({
    sourceX: link.source.x,
    sourceY: link.source.y,
    targetX: link.target.x,
    targetY: link.target.y,
  });
  const pathRef = useRef<SVGPathElement | null>(null);
  const doneRef = useRef<(() => void) | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const updateTweenRef = useRef<gsap.core.Tween | null>(null);
  const prevLink = usePrevious(link);

  useEffect(function onInit() {
    console.log('link.onInit', getLinkKey(link));
    const path = pathRef.current!;
    const pathCoords = pathCoordsRef.current;
    const d = graphLinkHorizontal({
      source: [pathCoords.sourceX, pathCoords.sourceY],
      target: [pathCoords.targetX, pathCoords.targetY],
    })!;
    path.setAttribute('d', d);
    path.setAttribute('opacity', '0');
  }, []);

  useEffect(
    function onUpdate() {
      if (prevLink && inProp) {
        console.log('link.onUpdate', getLinkKey(link));
        const path = pathRef.current!;
        updateTweenRef.current?.kill();
        updateTweenRef.current = gsap.to(pathCoordsRef.current, {
          sourceX: link.source.x,
          sourceY: link.source.y,
          targetX: link.target.x,
          targetY: link.target.y,
          onUpdate() {
            const [target] = this.targets();
            const d = graphLinkHorizontal({
              source: [target.sourceX, target.sourceY],
              target: [target.targetX, target.targetY],
            })!;
            path.setAttribute('d', d);
          },
          duration: duration,
          delay: duration,
        });
      }
    },
    [link]
  );

  return (
    <Transition<any>
      appear={true}
      // mountOnEnter={true}
      // unmountOnExit={true}
      in={inProp}
      addEndListener={(node: any, done: () => void) => {
        doneRef.current = done;
      }}
      onEnter={() => {
        const path = pathRef.current!;
        console.log('link.onEnter', getLinkKey(link), {
          opacity: path.style.opacity,
        });
        tweenRef.current = gsap.to(path, {
          opacity: 1,
          duration,
          delay: 2 * duration,
          onComplete() {
            doneRef.current?.();
          },
          onInterrupt() {
            doneRef.current?.();
          },
        });
      }}
      onExit={() => {
        console.log('link.onExit', getLinkKey(link));
        const path = pathRef.current;
        // gsap.killTweensOf(path);
        tweenRef.current?.kill();
        tweenRef.current = gsap.to(path, {
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
        });
      }}
    >
      <path
        data-key={getLinkKey(link)}
        ref={pathRef}
        stroke="green"
        fill="transparent"
      />
    </Transition>
  );
}

function getBounds(nodes: NodeData<unknown>[], focus: number[]) {
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
  focus?: number[];
  nodeRenderer?: JSXElementConstructor<{ node: NodeData<T> }>;
}

export function Graph<T>({ nodes, links, focus, nodeRenderer }: GraphProps<T>) {
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
