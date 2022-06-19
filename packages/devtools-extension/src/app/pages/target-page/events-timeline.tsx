import React, {
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Tooltip, useTheme } from '@mui/material';
import {
  getOffsetTimestamp,
  getTimeline,
  getTimestampOffset,
  TimelineSlice,
} from '@app/pages/target-page/get-timeline';
import { RelatedEvent } from '@app/protocols/insights';
import { formatTimestamp } from '@app/utils/format-timestamp';

const height = 24;
const paddingX = 4;
const paddingY = 2;

interface EventsTimelineSliceProps {
  offset: number;
  slice: TimelineSlice;
}

function EventsTimelineSlice({ offset, slice }: EventsTimelineSliceProps) {
  const theme = useTheme();
  const total = slice.next + slice.error + slice.complete + slice.subscription;
  const h = height - 2 * paddingY;
  const nextOffset = paddingY;
  const nextHeight = (h * slice.next) / total;
  const errorOffset = nextOffset + nextHeight;
  const errorHeight = (h * slice.error) / total;
  const completeOffset = nextOffset + nextHeight + errorHeight;
  const completeHeight = (h * slice.complete) / total;
  const subscriptionOffset =
    nextOffset + nextHeight + errorHeight + completeHeight;
  const subscriptionHeight = (h * slice.subscription) / total;
  return (
    <>
      {nextHeight !== 0 && (
        <line
          stroke={theme.insights.event.next.secondary}
          strokeWidth={2}
          x1={offset}
          x2={offset}
          y1={nextOffset}
          y2={nextOffset + nextHeight}
        />
      )}
      {errorHeight !== 0 && (
        <line
          stroke={theme.insights.event.error.secondary}
          strokeWidth={2}
          x1={offset}
          x2={offset}
          y1={errorOffset}
          y2={errorOffset + errorHeight}
        />
      )}
      {completeHeight !== 0 && (
        <line
          stroke={theme.insights.event.complete.secondary}
          strokeWidth={2}
          x1={offset}
          x2={offset}
          y1={completeOffset}
          y2={completeOffset + completeHeight}
        />
      )}
      {subscriptionHeight !== 0 && (
        <line
          stroke={theme.insights.event.subscription.secondary}
          strokeWidth={2}
          x1={offset}
          x2={offset}
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

export interface EventsTimelineProps {
  events: RelatedEvent[];
  event?: RelatedEvent;
  onTimestampSelected: (timestamp: number) => void;
}

export function EventsTimeline({
  events,
  event,
  onTimestampSelected,
}: EventsTimelineProps) {
  const theme = useTheme();
  const elementRef = useRef<HTMLDivElement | null>(null);
  const { width } = useElementSize(elementRef);
  const timelineWidth = width / 2 - 2 * paddingX;
  const timeline = useMemo(
    () => getTimeline(events, timelineWidth),
    [events, timelineWidth]
  );
  const [timestamp, setTimestamp] = useState(0);
  const offset = useMemo(
    () =>
      event
        ? getTimestampOffset(
            event.timestamp,
            timeline.startTimestamp,
            timeline.endTimestamp,
            timelineWidth
          )
        : 0,
    [event, timeline, timelineWidth]
  );

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      const offset = (event.clientX - paddingX) / 2;
      setTimestamp(
        getOffsetTimestamp(
          offset,
          timeline.startTimestamp,
          timeline.endTimestamp,
          timelineWidth
        )
      );
    },
    [setTimestamp, timeline, timelineWidth]
  );

  const onClick = useCallback(() => {
    onTimestampSelected(timestamp);
  }, [timestamp]);

  return (
    <Tooltip followCursor title={formatTimestamp(timestamp)}>
      <div
        ref={elementRef}
        onClick={onClick}
        onMouseMove={onMouseMove}
        style={{
          width: '100%',
          display: 'flex',
          backgroundColor: theme.palette.divider,
          borderBottom: `thin solid ${theme.palette.background.default}`,
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`}>
          {timeline.slices.map((slice, offset) => (
            <EventsTimelineSlice slice={slice} offset={offset * 2 + paddingX} />
          ))}
          <circle
            fill={theme.palette.text.primary}
            r={3}
            cx={offset * 2 + paddingX}
            cy={0}
          />
          <circle
            fill={theme.palette.text.primary}
            r={3}
            cx={offset * 2 + paddingX}
            cy={height}
          />
        </svg>
      </div>
    </Tooltip>
  );
}
