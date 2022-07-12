import { styled } from '@mui/material';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { ChevronRight } from '@mui/icons-material';
import { fromEvent, map, switchMap, takeUntil } from 'rxjs';

const SidePanelDiv = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  maxWidth: '30%',
});
const SidePanelContentDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minWidth: '200px',
  overflow: 'auto',
});
const SidePanelResizerDiv = styled('div')(({ theme }) => ({
  width: '5px',
  position: 'relative',
  cursor: 'col-resize',
  transition: 'background .24s .24s',
  zIndex: 2,
  '&:before': {
    display: 'block',
    content: '""',
    width: '1px',
    background: theme.palette.divider,
    height: '100%',
  },
  '&[data-side=left]': {
    left: '-2px',
    '&:before': {
      marginLeft: '2px',
    },
  },
  '&[data-side=right]': {
    right: '-3px',
    '&:before': {
      marginRight: '2px',
    },
  },
  '&:hover': {
    background: theme.palette.primary.main,
  },
  '&:active': {
    background: theme.palette.primary.dark,
  },
}));
const SidePanelSectionDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});
const SidePanelSectionHeaderDiv = styled('div')(({ theme }) => ({
  paddingRight: '1rem',
  backgroundColor: theme.custom.sidePanelHeaderBackground,
  fontFamily: 'Monospace',
  fontWeight: 'bold',
  display: 'flex',
  borderBottom: `thin solid ${theme.palette.background.default}`,
  cursor: 'pointer',
  position: 'sticky',
  top: 0,
  zIndex: 1,
}));
const SidePanelSectionBodyDiv = styled('div')({});

export interface SidePanelProps {
  children: ReactNode | ReactNode[];
  side: 'left' | 'right';
  id?: string;
}

export function SidePanel(props: SidePanelProps) {
  const contentDivRef = useRef<HTMLDivElement | null>(null);
  const resizerDivRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const c = props.side === 'left' ? 1 : -1;
    if (contentDivRef.current && resizerDivRef.current) {
      const contentDiv = contentDivRef.current;
      const resizerDiv = resizerDivRef.current;
      const subscription = fromEvent(
        resizerDiv,
        'mousedown',
        (event: MouseEvent) => event.clientX
      )
        .pipe(
          switchMap((initialMouseX) => {
            const initialContentDivWidth =
              contentDiv.getBoundingClientRect().width;
            return fromEvent(document, 'mousemove', (event: MouseEvent) => {
              event.preventDefault();
              return event.clientX;
            }).pipe(
              map(
                (mouseX) =>
                  initialContentDivWidth + c * mouseX - c * initialMouseX
              ),
              takeUntil(fromEvent(document, 'mouseup'))
            );
          })
        )
        .subscribe((width) => {
          contentDiv.style.width = `${width}px`;
        });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);
  return (
    <SidePanelDiv>
      {props.side === 'right' && (
        <SidePanelResizerDiv data-side="right" ref={resizerDivRef} />
      )}
      <SidePanelContentDiv
        id={props.id}
        ref={contentDivRef}
        style={{ width: '400px' }}
      >
        {props.children}
      </SidePanelContentDiv>
      {props.side === 'left' && (
        <SidePanelResizerDiv data-side="left" ref={resizerDivRef} />
      )}
    </SidePanelDiv>
  );
}

export interface SidePanelSectionProps {
  title: string;
  children: ReactNode | ReactNode[];
}

export function SidePanelSection(props: SidePanelSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <SidePanelSectionDiv>
      <SidePanelSectionHeaderDiv onClick={() => setExpanded(!expanded)}>
        <ChevronRight
          style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
        />
        {props.title}
      </SidePanelSectionHeaderDiv>
      {expanded && (
        <SidePanelSectionBodyDiv>{props.children}</SidePanelSectionBodyDiv>
      )}
    </SidePanelSectionDiv>
  );
}
