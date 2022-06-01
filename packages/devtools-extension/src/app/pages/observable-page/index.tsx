import React, { useEffect, useRef, useState } from 'react';
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
// const treeLayout = tree().size([400, 400]);
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
        { name: 'Y', children: [{ name: 'Q' }, { name: 'P' }] },
      ],
    },
  ],
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
  return node.x + 200;
}

const nodeDuration = 1;
const linkDuration = 0.5;

const customEaseIn = CustomEase.create('custom', 'M0,0 C0.5,0 0.5,0.5 1,1 ');
const customEaseOut = CustomEase.create('custom', 'M0,0,C0.5,0.5,0.5,1,1,1');

function Node<T>(props: { node: HierarchyPointNode<T> }) {
  const circleRef = useRef<SVGCircleElement>();
  useEffect(() => {
    const circle = circleRef.current;
    if (circle) {
      const depth = props.node.depth;
      gsap.fromTo(
        circle,
        { opacity: 0 },
        { opacity: 1, duration: nodeDuration, delay: depth * linkDuration }
      );
    }
  }, []);
  return (
    <circle
      ref={circleRef}
      r={10}
      cx={x(props.node)}
      cy={y(props.node)}
      fill="red"
    />
  );
}

function Link<T>(props: { link: HierarchyPointLink<T> }) {
  const d = linkHorizontal()({
    source: [x(props.link.source), y(props.link.source)],
    target: [x(props.link.target), y(props.link.target)],
  })!;
  const pathRef = useRef<SVGPathElement>();
  useEffect(() => {
    const path = pathRef.current;
    if (path) {
      const length = path.getTotalLength();
      const depth = props.link.source.depth;
      const ease =
        props.link.source.parent === undefined
          ? customEaseIn
          : props.link.target.children === undefined
          ? customEaseOut
          : 'none';
      gsap.fromTo(
        path,
        { strokeDasharray: length, strokeDashoffset: length },
        {
          strokeDashoffset: 0,
          duration: linkDuration,
          delay: depth * linkDuration,
          ease: 'none',
        }
      );
    }
  }, []);

  return <path ref={pathRef} d={d} stroke="green" fill="transparent" />;
}

function Graph<T>(props: { rootHierarchyNode: HierarchyNode<T> }) {
  const { nodes, links } = getNodesAndLinks(
    treeLayout(props.rootHierarchyNode)
  );

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      {links.map((link) => (
        <Link
          key={`${link.source.data.name}:${link.target.data.name}`}
          link={link}
        />
      ))}
      {nodes.map((node) => (
        <Node key={node.data.name} node={node} />
      ))}
    </svg>
  );
}

export function ObservablePage() {
  const info = useSelector(observableInfo);
  const [key, setKey] = useState(0);
  const [root, setRoot] = useState(rootHierarchyNodeA);
  if (info) {
    return (
      <Scrollable>
        <Container>
          <button onClick={() => setKey(key + 1)}>Rerun</button>
          <button onClick={() => setRoot(rootHierarchyNodeA)}>Root A</button>
          <button onClick={() => setRoot(rootHierarchyNodeB)}>Root B</button>
          <RefOutlet reference={info.target} />
          <Graph rootHierarchyNode={root} key={key} />
        </Container>
      </Scrollable>
    );
  } else {
    return null;
  }
}
