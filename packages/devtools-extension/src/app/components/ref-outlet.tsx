import {
  ArrayRef,
  EntriesRef,
  EventRef,
  FunctionRef,
  GetterRef,
  LocationRef,
  MapEntryRef,
  MapRef,
  ObjectRef,
  ObservableRef,
  PropertyRef,
  Ref,
  SetRef,
  SubscriberRef,
  SymbolRef,
  TextRef,
  ValueRef,
} from '@app/protocols/refs';
import React, {
  JSXElementConstructor,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { styled } from '@mui/material';
import {
  refStateSelector,
  refUiStateSelector,
} from '@app/selectors/refs-selectors';
import { useDispatch, useSelectorFunction, useStore } from '@app/store';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { RefState, RefUiState } from '@app/store/refs';
import {
  Action,
  createSelector,
  StoreView,
  useDispatchCallback,
} from '@lib/store';
import { Indent } from '@app/components/indent';
import { useLastDefinedValue } from '@app/utils';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';
import { SidePanelEntry } from '@app/components/side-panel';

interface TagRendererProps<REF extends Ref> {
  reference: REF;
}

const ObservableSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.insights.observable.secondary,
  '&:before': {
    display: 'inline',
    content: '"⊚ "',
    fontWeight: 900,
    color: theme.insights.observable.primary,
  },
  '&:after': {
    display: 'inline',
    content: '" " attr(data-tags) "#" attr(data-id)',
    color: theme.inspector.secondary,
  },
}));

function ObservableTag(props: TagRendererProps<ObservableRef>) {
  return (
    <ObservableSpan
      data-id={props.reference.id}
      data-tags={
        props.reference.tags.length !== 0
          ? `[${props.reference.tags.join(', ')}]`
          : ''
      }
    >
      {props.reference.name}
    </ObservableSpan>
  );
}

const SubscriberSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.insights.subscriber.secondary,
  '&:before': {
    display: 'inline',
    content: '"⊙ "',
    fontWeight: 900,
    color: theme.insights.subscriber.primary,
  },
  '&:after': {
    display: 'inline',
    content: '" " attr(data-tags) "#" attr(data-id)',
    color: theme.inspector.secondary,
  },
}));

function SubscriberTag(props: TagRendererProps<SubscriberRef>) {
  return (
    <SubscriberSpan
      data-id={props.reference.id}
      data-tags={
        props.reference.tags.length !== 0
          ? `[${props.reference.tags.join(', ')}]`
          : ''
      }
    >
      {props.reference.name}
    </SubscriberSpan>
  );
}

const EventSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.insights.subscriber.secondary,
  '&[data-type=subscribe]': {
    color: theme.insights.event.subscription.secondary,
    '&:before': {
      content: '"⤽ "',
      color: theme.insights.event.subscription.primary,
    },
  },
  '&[data-type=unsubscribe]': {
    color: theme.insights.event.subscription.secondary,
    '&:before': {
      content: '"⤼ "',
      color: theme.insights.event.subscription.primary,
    },
  },
  '&[data-type=next]': {
    color: theme.insights.event.next.secondary,
    '&:before': {
      content: '"↷ "',
      color: theme.insights.event.next.primary,
    },
  },
  '&[data-type=error]': {
    color: theme.insights.event.error.secondary,
    '&:before': {
      content: '"↷ "',
      color: theme.insights.event.error.primary,
    },
  },
  '&[data-type=complete]': {
    color: theme.insights.event.complete.secondary,
    '&:before': {
      content: '"↷ "',
      color: theme.insights.event.complete.primary,
    },
  },
  '&:before': {
    display: 'inline',
    fontWeight: 900,
  },
  '&:after': {
    display: 'inline',
    content: '" @" attr(data-time)',
    color: theme.inspector.secondary,
  },
  '&[data-data]:after': {
    content: '" @" attr(data-time) " { " attr(data-data) " }"',
  },
}));

const EventDataSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  '&>*': {
    opacity: 0.75,
  },
  '&:before': {
    display: 'inline',
    content: '" { "',
    color: theme.inspector.secondary,
  },
  '&:after': {
    display: 'inline',
    content: '" }"',
    color: theme.inspector.secondary,
  },
}));

function EventTag(props: TagRendererProps<EventRef>) {
  const data = props.reference.data;
  const DataTagRenderer = data ? tagRenderers[data.type] : undefined;
  return (
    <EventSpan
      data-type={props.reference.eventType}
      data-time={props.reference.time}
    >
      {props.reference.name}
      {data && DataTagRenderer ? (
        <EventDataSpan>
          <DataTagRenderer reference={data} />
        </EventDataSpan>
      ) : null}
    </EventSpan>
  );
}

const LocationSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  textDecoration: 'underline',
  cursor: 'pointer',
  color: theme.inspector.secondary,
}));

function LocationTag(props: TagRendererProps<LocationRef>) {
  const { file, line, column } = props.reference;
  const shortName = `${file.split('/').at(-1)}:${line}`;
  const longName = `${file}:${line}:${column}`;
  const onOpen = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      chrome.devtools.panels.openResource(file, line - 1, () => {});
    },
    [props.reference]
  );
  return (
    <LocationSpan title={longName} onClick={onOpen}>
      {shortName}
    </LocationSpan>
  );
}

const ObjectSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.primary,
  '&:after': {
    display: 'inline',
    content: '"{}"',
  },
}));

function ObjectTag(props: TagRendererProps<ObjectRef>) {
  return <ObjectSpan>{props.reference.name}</ObjectSpan>;
}

const ArraySpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.primary,
  '&:after': {
    display: 'inline',
    content: '"[] (" attr(data-length) ")"',
  },
}));

function ArrayTag(props: TagRendererProps<ArrayRef>) {
  return (
    <ArraySpan data-length={props.reference.length}>
      {props.reference.name}
    </ArraySpan>
  );
}

const FunctionSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.inspector.primary,
  '&:before': {
    display: 'inline',
    content: '"f "',
    color: theme.inspector.function,
  },
  '&:after': {
    display: 'inline',
    content: '"()"',
  },
}));

function FunctionTag(props: TagRendererProps<FunctionRef>) {
  return <FunctionSpan>{props.reference.name}</FunctionSpan>;
}

const CollectionSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.primary,
  '&:after': {
    display: 'inline',
    content: '"{} (" attr(data-size) ")"',
  },
}));

function CollectionTag(props: TagRendererProps<SetRef | MapRef>) {
  return (
    <CollectionSpan data-size={props.reference.size}>
      {props.reference.name}
    </CollectionSpan>
  );
}

const MapEntrySpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.inspector.secondary,
  '&>*': {
    opacity: 0.75,
  },
}));

function MapEntryTag(props: TagRendererProps<MapEntryRef>) {
  const { key, val } = props.reference;
  const KeyTagRenderer = tagRenderers[key.type];
  const ValTagRenderer = tagRenderers[val.type];

  return (
    <MapEntrySpan>
      {'{ '}
      <KeyTagRenderer reference={key} />
      {' => '}
      <ValTagRenderer reference={val} />
      {' }'}
    </MapEntrySpan>
  );
}

const EntriesSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.primary,
  '&:after': {
    display: 'inline',
    content: '"(" attr(data-size) ")"',
  },
}));

function EntriesTag(props: TagRendererProps<EntriesRef>) {
  return <EntriesSpan data-size={props.reference.size} />;
}

const StringSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.string,
  '&:before': {
    display: 'inline',
    content: '"\'"',
  },
  '&:after': {
    display: 'inline',
    content: '"\'"',
  },
}));

function StringTag(props: TagRendererProps<ValueRef>) {
  return <StringSpan>{props.reference.value}</StringSpan>;
}

const NumberSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.number,
}));

function NumberTag(props: TagRendererProps<ValueRef>) {
  return <NumberSpan>{String(props.reference.value)}</NumberSpan>;
}

const BigintSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.number,
  '&:after': {
    display: 'inline',
    content: '"n"',
  },
}));

const BooleanSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.boolean,
}));

function BooleanTag(props: TagRendererProps<ValueRef>) {
  return <BooleanSpan>{String(props.reference.value)}</BooleanSpan>;
}

function BigintTag(props: TagRendererProps<ValueRef>) {
  return <BigintSpan>{props.reference.value}</BigintSpan>;
}

const SymbolSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.symbol,
}));

function SymbolTag(props: TagRendererProps<SymbolRef>) {
  return <SymbolSpan>{props.reference.name}</SymbolSpan>;
}

const TextSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.primary,
  '&[data-prefix]:before': {
    display: 'inline',
    content: 'attr(data-prefix) " "',
    color: theme.inspector.secondary,
  },
  '&[data-suffix]:after': {
    display: 'inline',
    content: '" " attr(data-suffix)',
    color: theme.inspector.secondary,
  },
}));

function TextTag(props: TagRendererProps<TextRef>) {
  return (
    <TextSpan
      data-prefix={props.reference.prefix}
      data-suffix={props.reference.suffix}
    >
      {props.reference.text}
    </TextSpan>
  );
}

const UndefinedSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.undefined,
}));

function UndefinedTag() {
  return <UndefinedSpan>undefined</UndefinedSpan>;
}

const NullSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.null,
}));

function NullTag() {
  return <NullSpan>null</NullSpan>;
}

const tagRenderers: Record<
  string,
  JSXElementConstructor<TagRendererProps<any>>
> = {
  object: ObjectTag,
  array: ArrayTag,
  function: FunctionTag,
  set: CollectionTag,
  map: CollectionTag,
  'map-entry': MapEntryTag,
  entries: EntriesTag,
  string: StringTag,
  number: NumberTag,
  boolean: BooleanTag,
  bigint: BigintTag,
  symbol: SymbolTag,
  undefined: UndefinedTag,
  null: NullTag,
  observable: ObservableTag,
  subscriber: SubscriberTag,
  event: EventTag,
  location: LocationTag,
  text: TextTag,
};

function getTagRenderer(type: string) {
  const tagRenderer = tagRenderers[type];
  if (tagRenderer) {
    return tagRenderer;
  } else {
    throw new Error(`TagRenderer not found for type '${type}'.`);
  }
}

const MonospaceSpan = styled('span')(({ theme }) => ({
  display: 'inline',
  fontFamily: 'Monospace',
}));

const LabelSpan = styled('span')(({ theme }) => ({
  display: 'inline',
  fontFamily: 'Monospace',
  '&[data-type=enumerable]': {
    color: theme.inspector.enumerable,
  },
  '&[data-type=nonenumerable]': {
    color: theme.inspector.nonenumerable,
  },
  '&[data-type=special]': {
    color: theme.inspector.special,
  },
  '&:before': {
    display: 'inline',
    content: '"  "',
    color: theme.inspector.secondary,
    whiteSpace: 'pre',
  },
  '&[data-state=expanded]:before': {
    content: '"▾ "',
  },
  '&[data-state=collapsed]:before': {
    content: '"▸ "',
  },
  '&:not(:empty):after': {
    display: 'inline',
    content: '": "',
    color: theme.inspector.secondary,
  },
}));
const RefOutletDiv = styled('div')({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'start',
});

const EntryDiv = styled('div')({
  display: 'inline-block',
  textAlign: 'left',
  cursor: 'default',
  whiteSpace: 'nowrap',
});

function ObjectRefOutletRenderer(
  props: RefOutletRendererProps<Extract<Ref, { objectId?: number }>>
) {
  const dispatch = useDispatch();
  const onToggle = useCallback(() => {
    if (props.expanded) {
      dispatch(
        refOutletActions.Collapse({
          ref: props.reference,
          stateKey: props.stateKey,
          path: props.path,
        })
      );
    } else {
      dispatch(
        refOutletActions.Expand({
          ref: props.reference,
          stateKey: props.stateKey,
          path: props.path,
        })
      );
    }
  }, [props.expanded, props.reference.objectId]);
  const TagRenderer = getTagRenderer(props.reference.type);

  return (
    <EntryDiv onClick={onToggle}>
      <Indent indent={props.indent} />
      <LabelSpan
        data-state={props.expanded ? 'expanded' : 'collapsed'}
        data-type={props.type}
      >
        {props.label}
      </LabelSpan>
      <TagRenderer reference={props.reference} />
    </EntryDiv>
  );
}
function ValueRefOutletRenderer(props: RefOutletRendererProps) {
  const TagRenderer = getTagRenderer(props.reference.type);

  return (
    <EntryDiv>
      <Indent indent={props.indent} />
      <LabelSpan data-type={props.type}>{props.label}</LabelSpan>
      <TagRenderer reference={props.reference} />
    </EntryDiv>
  );
}

function GetterRefOutletRenderer(props: RefOutletRendererProps<GetterRef>) {
  const dispatch = useDispatch();
  const onInvoke = useCallback(() => {
    dispatch(
      refOutletActions.InvokeGetter({
        ref: props.reference,
        stateKey: props.stateKey,
        path: props.path,
      })
    );
  }, [props.reference.targetObjectId]);

  return (
    <EntryDiv>
      <Indent indent={props.indent} />
      <LabelSpan data-type={props.type}>{props.label}</LabelSpan>
      <a onClick={onInvoke}>
        <MonospaceSpan sx={{ title: 'Invoke getter' }}>(...)</MonospaceSpan>
      </a>
    </EntryDiv>
  );
}

interface RefOutletEntry {
  id: string;
  indent: number;
  path: string;
  ref: Ref;
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string;
  expandable: boolean;
  expanded: boolean;
}

interface ActionOutletEntry {
  id: string;
  indent: number;
  action: () => Action;
  label: string;
}

type Entry = RefOutletEntry | ActionOutletEntry;

function addActions(
  entries: Entry[],
  indent: number,
  ref: Ref,
  stateKey: string,
  path: string
) {
  switch (ref.type) {
    case 'observable':
    case 'subscriber':
      entries.push({
        id: `${stateKey}:${path}:action:focus`,
        action: () => refOutletContextActions.FocusTarget({ target: ref }),
        indent,
        label: `Focus ${ref.type}`,
      });
      break;
    case 'event': {
      entries.push({
        id: `${stateKey}:${path}:action:focus`,
        action: () => refOutletContextActions.FocusEvent({ event: ref }),
        indent,
        label: `Focus event`,
      });
      break;
    }
  }
}

function getRefOutletEntriesVisitor(
  entries: Entry[],
  stateKey: string,
  ref: Ref,
  indent: number,
  path: string,
  expandedObjects: Record<number, PropertyRef[]>,
  expandedPaths: Set<string>,
  type?: 'enumerable' | 'nonenumerable' | 'special',
  label?: string
): boolean {
  const expandable = 'objectId' in ref && ref.objectId !== undefined;
  const expanded = expandedPaths.has(path);

  entries.push({
    id: `${stateKey}:${path}`,
    ref,
    indent,
    label,
    type,
    path,
    expanded,
    expandable,
  });

  const objectId = (ref as { objectId: number }).objectId;
  if (expandable && expanded) {
    if (expandedObjects[objectId] === undefined) {
      return false;
    } else {
      addActions(entries, indent + 1, ref, stateKey, path);
      for (const prop of expandedObjects[objectId]) {
        if (
          !getRefOutletEntriesVisitor(
            entries,
            stateKey,
            prop.val,
            indent + 1,
            `${path}.${prop.keyId}`,
            expandedObjects,
            expandedPaths,
            prop.type,
            prop.key
          )
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

function getRefOutletEntries(
  rootRef: Ref,
  stateKey: string,
  state: RefState,
  uiState: RefUiState,
  type?: 'enumerable' | 'nonenumerable' | 'special',
  label?: string
) {
  const entries: Entry[] = [];

  if (
    getRefOutletEntriesVisitor(
      entries,
      stateKey,
      rootRef,
      0,
      'root',
      state.expandedObjects,
      uiState.expandedPaths,
      type,
      label
    )
  ) {
    return entries;
  } else {
    return undefined;
  }
}

const vmSelector = (
  stateKey: string,
  ref: Ref,
  type?: 'enumerable' | 'nonenumerable' | 'special',
  label?: string
) =>
  createSelector(
    [refStateSelector(stateKey), refUiStateSelector(stateKey)],
    ([state, uiState]) => {
      const entries = getRefOutletEntries(
        ref,
        stateKey,
        state,
        uiState,
        type,
        label
      );
      return entries ? { entries } : undefined;
    }
  );

const vmSelector2 = (
  stateKey: string,
  ref: Ref,
  type?: 'enumerable' | 'nonenumerable' | 'special',
  label?: string
) =>
  createSelector(
    [refStateSelector(stateKey), refUiStateSelector(stateKey)],
    ([state, uiState]) => {
      return getRefOutletEntries(
        ref,
        stateKey,
        state,
        uiState,
        type,
        label
      )?.map(
        (entry): SidePanelEntry => ({
          key: entry.id,
          getHeight(): number {
            return 24;
          },
          render() {
            return 'action' in entry ? (
              <ActionOutletEntry key={entry.id} {...entry} />
            ) : (
              <RefOutletEntry
                key={entry.id}
                indent={entry.indent}
                stateKey={stateKey}
                path={entry.path}
                reference={entry.ref}
                expanded={entry.expanded}
                expandable={entry.expandable}
                label={entry.label}
                type={entry.type}
                summary={false}
              />
            );
          },
        })
      );
    }
  );

export interface RefOutletEntryProps {
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string | number;
  indent: number;
  stateKey: string;
  path: string;
  reference: Ref;
  expanded: boolean;
  expandable: boolean;
  summary: boolean;
}

export interface RefOutletRendererProps<REF extends Ref = Ref> {
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string | number;
  indent: number;
  stateKey: string;
  path: string;
  reference: REF;
  expanded: boolean;
  expandable: boolean;
}

const ActionSpan = styled('span')(({ theme }) => ({
  display: 'inline',
  fontFamily: 'Monospace',
  textDecoration: 'underline',
  cursor: 'pointer',
  color: theme.inspector.secondary,
  '&:before': {
    display: 'inline-block',
    content: '"» "',
    color: theme.inspector.secondary,
    whiteSpace: 'pre',
  },
}));

export function ActionOutletEntry({
  label,
  indent,
  action,
}: ActionOutletEntry) {
  const onClick = useDispatchCallback(action, []);

  return (
    <EntryDiv>
      <Indent indent={indent} />
      <ActionSpan onClick={onClick}>{label}</ActionSpan>
    </EntryDiv>
  );
}

export function RefOutletEntry({
  reference,
  summary,
  ...props
}: RefOutletEntryProps) {
  if (reference.type === 'getter') {
    return <GetterRefOutletRenderer reference={reference} {...props} />;
  } else if (
    !summary &&
    'objectId' in reference &&
    reference.objectId !== undefined
  ) {
    return <ObjectRefOutletRenderer reference={reference} {...props} />;
  } else {
    return <ValueRefOutletRenderer reference={reference} {...props} />;
  }
}

export interface RefSummaryOutletProps {
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string;
  reference: Ref;
}

export function RefSummaryOutlet({
  reference,
  type,
  label,
}: RefSummaryOutletProps) {
  return (
    <ValueRefOutletRenderer
      indent={0}
      stateKey={'summary'}
      type={type}
      label={label}
      path={'root'}
      reference={reference}
      expanded={false}
      expandable={false}
    />
  );
}

export interface RefOutletProps {
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string;
  reference: Ref;
  stateKey: string;
}

export interface RefEntryDef {
  key: string;
  ref: Ref;
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string;
}

class RefEntriesManager {
  private selections = new Map<
    string,
    StoreView<SidePanelEntry[] | undefined, void>
  >();
  private entries = new Map<string, SidePanelEntry[]>();

  constructor(
    private readonly store: ReturnType<typeof useStore>,
    private defs: RefEntryDef[]
  ) {
    for (const def of defs) {
      const selection = vmSelector2(
        def.key,
        def.ref,
        def.type,
        def.label
      ).select(store, {
        mode: 'pull',
      });
      this.selections.set(def.key, selection);
      this.entries.set(def.key, selection.get() ?? []);
    }
  }

  update(defs: RefEntryDef[]) {
    const newSelections = new Map<
      string,
      StoreView<SidePanelEntry[] | undefined, void>
    >();
    const newEntries = new Map<string, SidePanelEntry[]>();

    for (const def of defs) {
      const selection =
        this.selections.get(def.key) ??
        vmSelector2(def.key, def.ref, def.type, def.label).select(this.store, {
          mode: 'pull',
        });
      const entries = selection.get() ?? this.entries.get(def.key) ?? [];

      newSelections.set(def.key, selection);
      newEntries.set(def.key, entries);
    }

    this.defs = defs;
    this.selections = newSelections;
    this.entries = newEntries;
  }

  get(): SidePanelEntry[] {
    return this.defs.flatMap((def) => this.entries.get(def.key) ?? []);
  }
}

export function useRefsSection(defs: RefEntryDef[]): SidePanelEntry[] {
  const store = useStore();
  const manager = useRef(new RefEntriesManager(store, defs));
  const [entries, setEntries] = useState<SidePanelEntry[]>(() =>
    manager.current.get()
  );
  useEffect(
    function updateEntries() {
      const subscription = store.subscribe(() => {
        console.time('updateEntries');
        manager.current.update(defs);
        const entries = manager.current.get();
        setEntries(entries);
        console.timeEnd('updateEntries');
      });

      return () => subscription.unsubscribe();
    },
    [defs]
  );

  return entries;
}

export function RefOutlet({
  type = 'enumerable',
  label,
  reference,
  stateKey,
}: RefOutletProps) {
  const vm = useLastDefinedValue(
    useSelectorFunction(vmSelector, stateKey, reference, type, label),
    { entries: [] }
  );
  return (
    <>
      {vm.entries.map((entry) =>
        'action' in entry ? (
          <ActionOutletEntry key={entry.id} {...entry} />
        ) : (
          <RefOutletEntry
            key={entry.id}
            indent={entry.indent}
            stateKey={stateKey}
            path={entry.path}
            reference={entry.ref}
            expanded={entry.expanded}
            expandable={entry.expandable}
            label={entry.label}
            type={entry.type}
            summary={false}
          />
        )
      )}
    </>
  );
}
