import { styled } from '@mui/material';
import React, {
  ForwardedRef,
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ChevronRight } from '@mui/icons-material';
import { fromEvent, map, switchMap, takeUntil } from 'rxjs';
import { defaultRangeExtractor, Range, useVirtual } from 'react-virtual';

const SidePanelDiv = styled('div')({
  display: 'flex',
  flexDirection: 'row',
});
const SidePanelContentDiv = styled('div')({
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
  sticky?: boolean;
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

function getEntries(
  sections: SidePanelSection[],
  expandedSections: Set<string>,
  setSectionExpanded: (section: string, expanded: boolean) => void
) {
  const entries: SidePanelEntry[] = [];

  for (const section of sections) {
    const expanded = expandedSections.has(section.label);
    const setExpanded = (expanded: boolean) => {
      setSectionExpanded(section.label, expanded);
    };

    entries.push({
      sticky: true,
      key: `section:${section.label}`,
      getHeight(): number {
        return 25;
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

  return useMemo(
    () => getEntries(sections, expandedSections, setSectionExpanded),
    [sections, expandedSections, setSectionExpanded]
  );
}

function getStickyIndices(entries: SidePanelEntry[]) {
  const stickyIndices: number[] = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.sticky) {
      stickyIndices.push(i);
    }
  }

  return stickyIndices;
}

export interface SidePanelControl {
  scrollToKey(key: string): void;
}

function scrollBy(containerElement: HTMLDivElement, offset: number) {
  const start = containerElement.scrollTop;
  const end = start + containerElement.offsetHeight;
  const to = containerElement.offsetHeight / 2 + offset;

  const padding = 96;

  if (to >= start + padding && to <= end - padding) {
    return;
  } else if (to < start + padding) {
    containerElement.scrollBy({
      behavior: 'smooth',
      top: to - start - padding,
    });
  } else {
    containerElement.scrollBy({
      behavior: 'smooth',
      top: to - end + padding,
    });
  }
}

export function useSmoothScrollToFn(
  parentRef: React.MutableRefObject<HTMLDivElement | null>
) {
  return React.useCallback((offset) => {
    if (parentRef.current) {
      scrollBy(parentRef.current, offset);
    }
  }, []);
}

export const SidePanel = React.memo(
  React.forwardRef(function SidePanel(
    { side, minWidth = '200px', maxWidth = '50%', sections }: SidePanelProps,
    forwardedRef: ForwardedRef<SidePanelControl>
  ) {
    const contentDivRef = useRef<HTMLDivElement | null>(null);
    const resizerDivRef = useRef<HTMLDivElement | null>(null);
    useResizer(side, contentDivRef, resizerDivRef);
    const entries = useEntries(sections);
    const stickyIndices = useMemo(() => getStickyIndices(entries), [entries]);
    const activeStickyIndexRef = useRef(-1);
    const isActiveSticky = (index: number) =>
      activeStickyIndexRef.current === index;

    const scrollToFn = useSmoothScrollToFn(contentDivRef);

    const virtualizer = useVirtual({
      size: entries.length,
      overscan: 5,
      parentRef: contentDivRef,
      estimateSize: useCallback((i) => entries[i].getHeight(), [entries]),
      rangeExtractor: useCallback(
        (range: Range) => {
          activeStickyIndexRef.current =
            [...stickyIndices]
              .reverse()
              .find((index) => range.start >= index) ?? -1;

          const next = new Set([
            activeStickyIndexRef.current,
            ...defaultRangeExtractor(range),
          ]);

          return [...next].sort((a, b) => a - b);
        },
        [stickyIndices]
      ),
      scrollToFn,
    });

    useImperativeHandle(
      forwardedRef,
      () => ({
        scrollToKey(key: string) {
          const index = entries.findIndex((entry) => entry.key === key);
          if (index !== -1) {
            virtualizer.scrollToIndex(index, { align: 'center' });
          }
        },
      }),
      [entries, virtualizer]
    );

    return (
      <SidePanelDiv style={{ maxWidth }}>
        {side === 'right' && (
          <SidePanelResizerDiv data-side="right" ref={resizerDivRef} />
        )}
        <SidePanelContentDiv
          ref={contentDivRef}
          style={{ width: '400px', minWidth }}
        >
          <div
            style={{
              height: `${virtualizer.totalSize}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.virtualItems.map((virtualRow) => {
              const entry = entries[virtualRow.index];
              const Render = entry.render;
              return (
                <div
                  key={virtualRow.index}
                  style={{
                    ...(entry.sticky
                      ? {
                          zIndex: 1,
                        }
                      : {}),
                    ...(isActiveSticky(virtualRow.index)
                      ? {
                          position: 'sticky',
                        }
                      : {
                          position: 'absolute',
                          transform: `translateY(${virtualRow.start}px)`,
                        }),
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${entry.getHeight()}px`,
                  }}
                >
                  <Render />
                </div>
              );
            })}
          </div>
        </SidePanelContentDiv>
        {side === 'left' && (
          <SidePanelResizerDiv data-side="left" ref={resizerDivRef} />
        )}
      </SidePanelDiv>
    );
  })
);

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
