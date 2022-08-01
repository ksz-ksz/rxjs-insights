import { styled } from '@mui/material';
import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ChevronRight } from '@mui/icons-material';
import { fromEvent, map, switchMap, takeUntil } from 'rxjs';

const SidePanelDiv = styled('div')({
  display: 'flex',
  flexDirection: 'row',
});
const SidePanelContentDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
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

export interface SidePanelEntry {
  key: string;
  getHeight(): number;
  render(): ReactElement;
}

export interface SidePanelSection {
  label: string;
  entries: SidePanelEntry[];
}

export interface SidePanelProps {
  side: 'left' | 'right';
  minWidth?: string | number;
  maxWidth?: string | number;
  sections: SidePanelSection[];
}

function useResizer(
  side: 'left' | 'right',
  contentDivRef: React.MutableRefObject<HTMLDivElement | null>,
  resizerDivRef: React.MutableRefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const c = side === 'left' ? 1 : -1;
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
}

export function useEntries(sections: SidePanelSection[]) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(({ label }) => label))
  );

  const setSectionExpanded = useCallback(
    (section: string, expanded: boolean) => {
      setExpandedSections((expandedSections) => {
        const newExpandedSection = new Set(expandedSections);
        if (expanded) {
          newExpandedSection.add(section);
        } else {
          newExpandedSection.delete(section);
        }
        return newExpandedSection;
      });
    },
    [setExpandedSections]
  );

  const entries: SidePanelEntry[] = [];

  for (const section of sections) {
    const expanded = expandedSections.has(section.label);
    const setExpanded = (expanded: boolean) => {
      setSectionExpanded(section.label, expanded);
    };

    entries.push({
      key: `section:${section.label}`,
      getHeight(): number {
        return 30;
      },
      render() {
        return (
          <SidePanelSectionRenderer
            label={section.label}
            expanded={expanded}
            setExpanded={setExpanded}
          />
        );
      },
    });

    if (expanded) {
      entries.push(...section.entries);
    }
  }

  return entries;
}

export function SidePanel({
  side,
  minWidth = '200px',
  maxWidth = '50%',
  sections,
}: SidePanelProps) {
  const contentDivRef = useRef<HTMLDivElement | null>(null);
  const resizerDivRef = useRef<HTMLDivElement | null>(null);
  useResizer(side, contentDivRef, resizerDivRef);
  const entries = useEntries(sections);

  return (
    <SidePanelDiv style={{ maxWidth }}>
      {side === 'right' && (
        <SidePanelResizerDiv data-side="right" ref={resizerDivRef} />
      )}
      <SidePanelContentDiv
        ref={contentDivRef}
        style={{ width: '400px', minWidth }}
      >
        {entries.map(({ key, render: Render }) => (
          <span key={key}>
            <Render />
          </span>
        ))}
      </SidePanelContentDiv>
      {side === 'left' && (
        <SidePanelResizerDiv data-side="left" ref={resizerDivRef} />
      )}
    </SidePanelDiv>
  );
}

interface SidePanelSectionRendererProps {
  label: string;
  expanded: boolean;
  setExpanded(expanded: boolean): void;
}

function SidePanelSectionRenderer({
  label,
  expanded,
  setExpanded,
}: SidePanelSectionRendererProps) {
  return (
    <SidePanelSectionHeaderDiv onClick={() => setExpanded(!expanded)}>
      <ChevronRight
        style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
      />
      {label}
    </SidePanelSectionHeaderDiv>
  );
}
