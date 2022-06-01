import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from '@app/store';
import { observableInfo } from '@app/selectors/insights-selectors';
import { RefOutlet } from '@app/components/ref-outlet';
import { Scrollable } from '@app/components/scrollable';
import { Container } from '@mui/material';

import {
  hierarchy,
  HierarchyNode,
  HierarchyPointLink,
  HierarchyPointNode,
  tree,
} from 'd3-hierarchy';
import { linkHorizontal } from 'd3-shape';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { Transition, TransitionGroup } from 'react-transition-group';

const treeLayout = tree().nodeSize([40, 80]);

const rootHierarchyNodeA = hierarchy({
  name: 'A',
  children: [
    { name: 'B', children: [{ name: 'D' }, { name: 'E' }] },
    {
      name: 'C',
      children: [
        { name: 'F' },
        { name: 'G' },
        {
          name: 'H',
          children: [{ name: 'I', children: [{ name: 'J' }] }, { name: 'K' }],
        },
      ],
    },
  ],
});

const rootHierarchyNodeB = hierarchy({
  name: 'A',
  children: [
    { name: 'B', children: [{ name: 'D' }, { name: 'E' }, { name: 'X' }] },
    {
      name: 'C',
      children: [
        { name: 'F' },
        {
          name: 'H',
          children: [{ name: 'I' }, { name: 'K' }],
        },
        { name: 'R', children: [{ name: 'Q' }, { name: 'P' }] },
      ],
    },
  ],
});

const rootHierarchyNodeA1 = hierarchy({
  name: 'A',
  children: [{ name: 'B', children: [{ name: 'E' }] }, { name: 'Y' }],
});

const rootHierarchyNodeB1 = hierarchy({
  name: 'A',
  children: [{ name: 'B', children: [{ name: 'D' }, { name: 'X' }] }],
});

function visitNodesAndLinks<T>(
  node: HierarchyPointNode<T>,
  nodes: HierarchyPointNode<T>[],
  links: HierarchyPointLink<T>[]
) {
  nodes.push(node);
  for (let link of node.links()) {
    if (link.source === node) {
      links.push(link);
      visitNodesAndLinks(link.target, nodes, links);
    }
  }
}

function getNodesAndLinks<T>(root: HierarchyPointNode<T>) {
  const nodes: HierarchyPointNode<T>[] = [];
  const links: HierarchyPointLink<T>[] = [];

  visitNodesAndLinks(root, nodes, links);

  return { nodes, links };
}

function x<T>(node: HierarchyPointNode<T>) {
  return node.y;
}

function y<T>(node: HierarchyPointNode<T>) {
  return node.x;
}

// const duration = 2;
const duration = 0.24;

const customEaseIn = CustomEase.create('custom', 'M0,0 C0.5,0 0.5,0.5 1,1 ');
const customEaseOut = CustomEase.create('custom', 'M0,0,C0.5,0.5,0.5,1,1,1');

function getNodeKey(node: HierarchyPointNode<any>) {
  return node.data.name;
}

function Node<T>(props: { in?: boolean; node: HierarchyPointNode<T> }) {
  const gRef = useRef<SVGGElement>();
  const doneRef = useRef(() => {});
  const prevNode = usePrevious(props.node);
  useEffect(() => {
    if (gRef.current && prevNode) {
      gsap.fromTo(
        gRef.current,
        {
          x: x(prevNode) - x(props.node),
          y: y(prevNode) - y(props.node),
        },
        {
          x: 0,
          y: 0,
          duration: duration,
          delay: duration,
        }
      );
    }
  }, [props.node]);
  // const circleRef = useRef<SVGCircleElement>();
  // useEffect(() => {
  //   const circle = circleRef.current;
  //   if (circle) {
  //     const depth = props.node.depth;
  //     gsap.fromTo(
  //       circle,
  //       { opacity: 0 },
  //       { opacity: 1, duration: nodeDuration, delay: depth * linkDuration }
  //     );
  //   }
  // }, []);
  return (
    <Transition<any>
      mountOnEnter={true}
      unmountOnExit={true}
      in={props.in}
      addEndListener={(node: any, done: () => void) => {
        console.log('addEndListener', getNodeKey(props.node));
        doneRef.current = done;
      }}
      onEnter={(node: any) => {
        console.log('onEnter', getNodeKey(props.node));
        const circle = node as SVGCircleElement;
        const depth = props.node.depth;
        gsap.fromTo(
          circle,
          { opacity: 0 },
          {
            opacity: 1,
            duration: duration,
            delay: duration + duration,
            onComplete() {
              doneRef.current();
            },
            onInterrupt() {
              doneRef.current();
            },
          }
        );
      }}
      onExit={(node: any) => {
        console.log('onExit', getNodeKey(props.node));
        const circle = node as SVGCircleElement;
        gsap.to(circle, { opacity: 0, delay: 0, duration });
      }}
    >
      <g ref={gRef}>
        <circle r={10} cx={x(props.node)} cy={y(props.node)} fill="red" />
        <text x={x(props.node)} y={y(props.node)} fill="white">
          {getNodeKey(props.node)}
        </text>
      </g>
    </Transition>
  );
}

function getLinkKey(link: HierarchyPointLink<any>) {
  return `${link.source.data.name}:${link.target.data.name}`;
}

function Link<T>(props: { in?: boolean; link: HierarchyPointLink<T> }) {
  const doneRef = useRef(() => {});
  const prevLink = usePrevious(props.link);
  const pathRef = useRef<SVGPathElement>();
  const d = linkHorizontal()({
    source: [x(props.link.source), y(props.link.source)],
    target: [x(props.link.target), y(props.link.target)],
  })!;

  useEffect(() => {
    if (pathRef.current && prevLink) {
      gsap.fromTo(
        {},
        {
          linkSourceX: x(prevLink.source),
          linkSourceY: y(prevLink.source),
          linkTargetX: x(prevLink.target),
          linkTargetY: y(prevLink.target),
        },
        {
          linkSourceX: x(props.link.source),
          linkSourceY: y(props.link.source),
          linkTargetX: x(props.link.target),
          linkTargetY: y(props.link.target),
          onUpdate() {
            const [target] = this.targets();
            const d = linkHorizontal()({
              source: [target.linkSourceX, target.linkSourceY],
              target: [target.linkTargetX, target.linkTargetY],
            })!;
            pathRef.current.setAttribute('d', d);
          },
          duration: duration,
          delay: duration,
        }
      );
    }
  }, [props.link]);

  return (
    <Transition<any>
      mountOnEnter={true}
      unmountOnExit={true}
      in={props.in}
      addEndListener={(node: any, done: () => void) => {
        console.log('addEndListener', getLinkKey(props.link));
        doneRef.current = done;
      }}
      onEnter={(node: any) => {
        console.log('onEnter', getLinkKey(props.link));
        const path = node as SVGPathElement;
        const length = path.getTotalLength();
        const depth = props.link.source.depth;
        gsap.fromTo(
          path,
          { opacity: 0 },
          {
            opacity: 1,
            duration,
            delay: duration + duration,
            ease: 'none',
            onComplete() {
              doneRef.current();
            },
          }
        );
      }}
      onExit={(node: any) => {
        console.log('onEnter', getLinkKey(props.link));
        const path = node as SVGPathElement;
        const length = path.getTotalLength();
        const depth = props.link.source.depth;
        gsap.fromTo(
          path,
          { opacity: 1 },
          {
            opacity: 0,
            duration,
            delay: 0,
            ease: 'none',
            onComplete() {
              doneRef.current();
            },
            onInterrupt() {
              doneRef.current();
            },
          }
        );
      }}
    >
      <path ref={pathRef} d={d} stroke="green" fill="transparent" />
    </Transition>
  );
}

function getBounds(nodes: HierarchyPointNode<any>[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const node of nodes) {
    const nodeX = x(node);
    const nodeY = y(node);
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

function Graph<T>(props: { rootHierarchyNode: HierarchyNode<T> }) {
  const svgRef = useRef<SVGSVGElement>();
  const { nodes, links } = useMemo(
    () => getNodesAndLinks(treeLayout(props.rootHierarchyNode)),
    [props.rootHierarchyNode]
  );
  const viewBox = useMemo(() => getViewBox(getBounds(nodes), 20), [nodes]);

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
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      ref={svgRef}
      style={{
        width: '100%',
        maxHeight: '600',
      }}
    >
      <TransitionGroup component="g">
        {links.map((link) => (
          <Link key={getLinkKey(link)} link={link} />
        ))}
      </TransitionGroup>

      <TransitionGroup component="g">
        {nodes.map((node) => (
          <Node key={getNodeKey(node)} node={node} />
        ))}
      </TransitionGroup>
    </svg>
  );
}

const roots = [
  rootHierarchyNodeA,
  rootHierarchyNodeB,
  rootHierarchyNodeA1,
  rootHierarchyNodeB1,
];

export function ObservablePage() {
  const info = useSelector(observableInfo);
  const [key, setKey] = useState(0);
  const [rootIndex, setRootIndex] = useState(0);
  if (info) {
    return (
      <Scrollable>
        <Container>
          <button onClick={() => setKey(key + 1)}>Rerun</button>
          <button onClick={() => setRootIndex((rootIndex + 1) % roots.length)}>
            Switch root
          </button>
          <RefOutlet reference={info.target} />
          <Graph rootHierarchyNode={roots[rootIndex]} key={key} />
        </Container>
      </Scrollable>
    );
  } else {
    return null;
  }
}

function usePrevious<T>(value: T): T | undefined {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T | undefined>();
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}
