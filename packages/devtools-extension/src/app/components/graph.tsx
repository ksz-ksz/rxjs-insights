import React, {
  ForwardRefExoticComponent,
  JSXElementConstructor,
  PropsWithoutRef,
  Ref,
  RefAttributes,
  RefObject,
  useEffect,
  useRef,
} from 'react';
import { usePrevious } from '@app/utils';
import gsap from 'gsap';
import { Transition, TransitionGroup } from 'react-transition-group';
import { linkHorizontal } from 'd3-shape';
import { LinkData, NodeData } from '@app/components/tree';

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
      <g data-key={getNodeKey(node)} ref={gRef}>
        <NodeRenderer node={node} />
      </g>
    </Transition>
  );
}

function getLinkKey(link: LinkData<unknown>) {
  return `${link.source.id}:${link.target.id}`;
}

export type Renderer<PROPS, CONTROL> = ForwardRefExoticComponent<
  PropsWithoutRef<PROPS> & RefAttributes<CONTROL>
>;

interface GraphLinkProps<T> {
  in?: boolean;
  link: LinkData<T>;
  linkRenderer?: Renderer<LinkRendererProps<T>, LinkControl>;
}

export type LinkRendererProps<T> = { link: LinkData<T> };

interface LinkControl {
  opacity: number;
  position: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  };
}

export class HorizontalLinkControl implements LinkControl {
  private static LINK = linkHorizontal();

  private _opacity = 0;
  private _position = {
    sourceX: 0,
    sourceY: 0,
    targetX: 0,
    targetY: 0,
  };

  constructor(private readonly pathRef: RefObject<SVGPathElement | null>) {}

  get opacity(): number {
    return this._opacity;
  }

  set opacity(opacity: number) {
    this._opacity = opacity;
    const path = this.pathRef.current!;
    path.setAttribute('opacity', String(opacity));
  }

  get position(): {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  } {
    return this._position;
  }

  set position(position: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  }) {
    this._position = position;
    const path = this.pathRef.current!;
    const d = HorizontalLinkControl.LINK({
      source: [position.sourceX, position.sourceY],
      target: [position.targetX, position.targetY],
    })!;
    path.setAttribute('d', d);
  }
}

const DefaultLinkRenderer = React.forwardRef<LinkControl>(function LinkRenderer(
  props,
  forwardedRef
) {
  const pathRef = useRef<SVGPathElement | null>(null);
  React.useImperativeHandle(
    forwardedRef,
    () => new HorizontalLinkControl(pathRef),
    []
  );

  return <path ref={pathRef} stroke="green" fill="transparent" />;
});

function GraphLink<T>({
  in: inProp,
  link,
  linkRenderer: LinkRenderer = DefaultLinkRenderer,
}: GraphLinkProps<T>) {
  const initRef = useRef(true);
  const linkRef = useRef<LinkControl | null>(null);
  const doneRef = useRef<(() => void) | null>(null);
  const opacityTweenRef = useRef<gsap.core.Tween | null>(null);
  const positionTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(
    function onUpdate() {
      if (initRef.current) {
        initRef.current = false;
        linkRef.current!.opacity = 0;
        linkRef.current!.position = {
          sourceX: link.source.x,
          sourceY: link.source.y,
          targetX: link.target.x,
          targetY: link.target.y,
        };
      } else if (inProp) {
        const startPosition = { ...linkRef.current!.position };
        positionTweenRef.current?.kill();
        positionTweenRef.current = gsap.to(startPosition, {
          sourceX: link.source.x,
          sourceY: link.source.y,
          targetX: link.target.x,
          targetY: link.target.y,
          onUpdate() {
            const [target] = this.targets();
            linkRef.current!.position = {
              sourceX: target.sourceX,
              sourceY: target.sourceY,
              targetX: target.targetX,
              targetY: target.targetY,
            };
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
      in={inProp}
      addEndListener={(node: any, done: () => void) => {
        doneRef.current = done;
      }}
      onEnter={() => {
        opacityTweenRef.current = gsap.to(linkRef.current!, {
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
        opacityTweenRef.current?.kill();
        opacityTweenRef.current = gsap.to(linkRef.current!, {
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
      <LinkRenderer link={link} ref={linkRef} />
    </Transition>
  );
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
  nodeRenderer?: JSXElementConstructor<NodeRendererProps<T>>;
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
