import React, { useMemo, useState } from 'react';
import { useSelector } from '@app/store';
import { RefOutlet } from '@app/components/ref-outlet';
import { Scrollable } from '@app/components/scrollable';
import { Box, Container, Divider, Paper } from '@mui/material';
import { Graph, NodeRendererProps } from '@app/components/graph';
import {
  RelatedHierarchyNode,
  Relations,
  TargetId,
} from '@app/protocols/insights';
import { getDoubleTree } from '@app/components/tree';
import { activeSubscriberStateSelector } from '@app/selectors/active-target-state-selector';
import { Event } from '@rxjs-insights/recorder';

function getTarget(relations: Relations, target: TargetId) {
  switch (target.type) {
    case 'subscriber':
      return relations.subscribers[target.id];
    case 'observable':
      return relations.observables[target.id];
  }
}

function getNodeRenderer(relations: Relations) {
  return function NodeRenderer({
    node,
  }: NodeRendererProps<RelatedHierarchyNode>) {
    const target = getTarget(relations, node.data.target);
    return (
      <>
        <circle r="6" fill="green" />
        <text fontSize="6" y="12" textAnchor="middle" fill="white">
          {target.name}#{target.id}
        </text>
      </>
    );
  };
}

export function SubscriberPage() {
  const [time, setTime] = useState(0);
  const state = useSelector(activeSubscriberStateSelector);
  const NodeRenderer = useMemo(
    () => (state ? getNodeRenderer(state.relations) : undefined),
    [state]
  );
  const { nodes, links } = useMemo(
    () =>
      state
        ? getDoubleTree(
            state.hierarchy.sources,
            state.hierarchy.destinations,
            (data) => data.target.id,
            (data) =>
              data.children.filter((child) => {
                const childTarget = getTarget(state.relations, child.target);
                return (
                  childTarget.startTime <= time && time <= childTarget.endTime
                );
              })
          )
        : { nodes: [], links: [] },
    [state, time]
  );
  const events = useMemo(
    () =>
      state
        ? Object.values(state.relations.events).sort((a, b) => a.time - b.time)
        : [],
    [state]
  );
  const ref = state?.ref;
  if (ref) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Box sx={{ width: '240px', flexGrow: 0, flexShrink: 0 }}>
          <Divider>EVENTS</Divider>
          <Scrollable>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {events.map((event) => (
                <a onClick={() => setTime(event.time)}>
                  <RefOutlet reference={event} />
                </a>
              ))}
            </Box>
          </Scrollable>
        </Box>
        <Divider orientation="vertical" />
        <Box sx={{ flexGrow: 1, flexShrink: 1 }}>
          <Graph nodes={nodes} links={links} nodeRenderer={NodeRenderer} />
        </Box>
      </Box>
    );
  } else {
    return null;
  }
}
