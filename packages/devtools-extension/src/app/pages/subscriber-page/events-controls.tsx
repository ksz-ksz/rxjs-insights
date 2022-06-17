import { IconButton, Stack } from '@mui/material';
import {
  FastForward,
  FastRewind,
  Pause,
  PlayArrow,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import React from 'react';

interface EventsControlsProps {
  playing: boolean;

  onGoToFirst(): void;

  onGoToPrev(): void;

  onPlay(): void;

  onPause(): void;

  onGoToNext(): void;

  onGoToLast(): void;
}

export function EventsControls(props: EventsControlsProps) {
  return (
    <Stack
      sx={{ backgroundColor: 'divider' }}
      direction="row"
      spacing={1}
      justifyContent="center"
    >
      <IconButton onClick={props.onGoToFirst}>
        <SkipPrevious />
      </IconButton>
      <IconButton onClick={props.onGoToPrev}>
        <FastRewind />
      </IconButton>
      {props.playing ? (
        <IconButton onClick={props.onPause}>
          <Pause />
        </IconButton>
      ) : (
        <IconButton onClick={props.onPlay}>
          <PlayArrow />
        </IconButton>
      )}
      <IconButton onClick={props.onGoToNext}>
        <FastForward />
      </IconButton>
      <IconButton onClick={props.onGoToLast}>
        <SkipNext />
      </IconButton>
    </Stack>
  );
}
