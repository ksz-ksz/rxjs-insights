import { RelatedEvent } from '@app/protocols/insights';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import { createSelector } from '@lib/store';
import {
  activeSubscriberStateSelector,
  activeSubscriberUiStateSelector,
} from '@app/selectors/active-target-state-selector';
import { getTargetTimeframes } from '@app/pages/subscriber-page/get-target-timeframes';
import { getEvents } from './get-events';
import { getIncludedEvents } from './get-included-events';
import { useSelectorFunction } from '@app/store';
import { useTheme } from '@mui/material';
import { timeSelector } from '@app/selectors/insights-selectors';

const height = 20;

interface Bucket {
  next: number;
  error: number;
  complete: number;
  subscription: number;
}

function getBucket(buckets: Record<number, Bucket>, timestamp: number) {
  let bucket = buckets[timestamp];
  if (bucket === undefined) {
    buckets[timestamp] = bucket = {
      next: 0,
      error: 0,
      complete: 0,
      subscription: 0,
    };
  }
  return bucket;
}

function getProjectedTimestamp(
  time: number,
  width: number,
  startTimestamp: number,
  endTimestamp: number
) {
  return Math.floor(
    ((width / 2) * (time - startTimestamp)) / (endTimestamp - startTimestamp)
  );
}

function getBuckets(
  events: RelatedEvent[],
  width: number,
  startTimestamp: number,
  endTimestamp: number
) {
  const buckets: Bucket[] = [];
  for (let event of events) {
    const time = event.timestamp;
    const timestamp = getProjectedTimestamp(
      time,
      width,
      startTimestamp,
      endTimestamp
    );
    const bucket = getBucket(buckets, timestamp);
    switch (event.eventType) {
      case 'next':
        bucket.next++;
        break;
      case 'error':
        bucket.error++;
        break;
      case 'complete':
        bucket.complete++;
        break;
      case 'subscribe':
      case 'unsubscribe':
        bucket.subscription++;
        break;
    }
  }
  return buckets;
}

const vmSelector = (width: number) =>
  createSelector(
    [
      activeSubscriberStateSelector,
      activeSubscriberUiStateSelector,
      timeSelector,
    ],
    ([activeSubscriberState, activeSubscriberUiState, time]) => {
      const { ref, relations } = activeSubscriberState!;
      const { expandedKeys } = activeSubscriberUiState!;
      const target = relations.targets[ref.id];
      const timeframes = getTargetTimeframes(target, relations, expandedKeys);
      const allEvents = getEvents(relations);
      const events = getIncludedEvents(relations, allEvents, timeframes);
      const startTimestamp = events[0].timestamp;
      const endTimestamp = events.at(-1)!.timestamp;
      const buckets = getBuckets(events, width, startTimestamp, endTimestamp);
      const event = relations.events[time];
      const timestamp = event
        ? getProjectedTimestamp(
            event.timestamp,
            width,
            startTimestamp,
            endTimestamp
          )
        : 0;

      return {
        buckets,
        timestamp,
      };
    }
  );

interface TimestampProps {
  time: number;
  bucket: Bucket;
}

function Timestamp({ time, bucket }: TimestampProps) {
  const theme = useTheme();
  const total =
    bucket.next + bucket.error + bucket.complete + bucket.subscription;
  const nextOffset = 0;
  const nextHeight = (height * bucket.next) / total;
  const errorOffset = nextHeight;
  const errorHeight = (height * bucket.error) / total;
  const completeOffset = nextHeight + errorHeight;
  const completeHeight = (height * bucket.complete) / total;
  const subscriptionOffset = nextHeight + errorHeight + completeHeight;
  const subscriptionHeight = (height * bucket.subscription) / total;
  return (
    <>
      {nextHeight !== 0 && (
        <line
          stroke={theme.insights.event.next.secondary}
          strokeWidth={2}
          x1={time * 2}
          x2={time * 2}
          y1={nextOffset}
          y2={nextOffset + nextHeight}
        />
      )}
      {errorHeight !== 0 && (
        <line
          stroke={theme.insights.event.error.secondary}
          strokeWidth={2}
          x1={time * 2}
          x2={time * 2}
          y1={errorOffset}
          y2={errorOffset + errorHeight}
        />
      )}
      {completeHeight !== 0 && (
        <line
          stroke={theme.insights.event.complete.secondary}
          strokeWidth={2}
          x1={time * 2}
          x2={time * 2}
          y1={completeOffset}
          y2={completeOffset + completeHeight}
        />
      )}
      {subscriptionHeight !== 0 && (
        <line
          stroke={theme.insights.event.subscription.secondary}
          strokeWidth={2}
          x1={time * 2}
          x2={time * 2}
          y1={subscriptionOffset}
          y2={subscriptionOffset + subscriptionHeight}
        />
      )}
    </>
  );
}

function useElementSize(elementRef: RefObject<Element>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      const observer = new ResizeObserver((entries) => {
        console.log('ResizeObserver', entries);
        for (let entry of entries) {
          if (entry.contentBoxSize) {
            setSize({
              width: entry.contentBoxSize[0].inlineSize,
              height: entry.contentBoxSize[0].blockSize,
            });
          }
        }
      });
      observer.observe(element);
      return () => {
        observer.unobserve(element);
      };
    }
  }, [elementRef.current]);
  return size;
}

export function Timeline() {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const { width } = useElementSize(elementRef);
  const theme = useTheme();
  const vm = useSelectorFunction(vmSelector, width - 8);

  return (
    <div
      ref={elementRef}
      style={{
        width: '100%',
        display: 'flex',
        padding: '2px 4px',
        backgroundColor: theme.palette.divider,
        borderBottom: `thin solid ${theme.palette.background.default}`,
      }}
    >
      <svg viewBox={`0 0 ${width - 8} ${height}`}>
        {vm.buckets.map((bucket, index) => {
          return <Timestamp bucket={bucket} time={index} />;
        })}
        <circle
          fill={theme.palette.text.primary}
          r={3}
          cx={vm.timestamp * 2}
          cy={0}
        />
        <circle
          fill={theme.palette.text.primary}
          r={3}
          cx={vm.timestamp * 2}
          cy={height}
        />
      </svg>
    </div>
  );
}
