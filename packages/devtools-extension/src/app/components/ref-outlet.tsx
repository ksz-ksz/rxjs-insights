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
import React, { JSXElementConstructor, MouseEvent, useCallback } from 'react';
import { styled } from '@mui/material';
import {
  refStateSelector,
  refUiStateSelector,
} from '@app/selectors/refs-selectors';
import { useDispatch, useSelectorFunction } from '@app/store';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { RefState, RefUiState } from '@app/store/refs';
import { createSelector } from '@lib/store';
import { Indent } from '@app/components/indent';

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

const RefOutletLabelDiv = styled('div')({
  display: 'inline-block',
  textAlign: 'left',
});
styled('div')({
  display: 'inline-flex',
  flexDirection: 'column',
  marginLeft: '2ch',
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
    <RefOutletDiv>
      <RefOutletLabelDiv onClick={onToggle}>
        <Indent indent={props.indent} />
        <LabelSpan
          data-state={props.expanded ? 'expanded' : 'collapsed'}
          data-type={props.type}
        >
          {props.label}
        </LabelSpan>
        <TagRenderer reference={props.reference} />
      </RefOutletLabelDiv>
    </RefOutletDiv>
  );
}
function ValueRefOutletRenderer(props: RefOutletRendererProps) {
  const TagRenderer = getTagRenderer(props.reference.type);

  return (
    <RefOutletLabelDiv>
      <Indent indent={props.indent} />
      <LabelSpan data-type={props.type}>{props.label}</LabelSpan>
      <TagRenderer reference={props.reference} />
    </RefOutletLabelDiv>
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
  }, [props.reference.objectId]);

  return (
    <RefOutletLabelDiv>
      <Indent indent={props.indent} />
      <LabelSpan data-type={props.type}>{props.label}</LabelSpan>
      <a onClick={onInvoke}>
        <MonospaceSpan sx={{ title: 'Invoke getter' }}>(...)</MonospaceSpan>
      </a>
    </RefOutletLabelDiv>
  );
}

interface RefOutletEntry {
  indent: number;
  path: string;
  ref: Ref;
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string;
  parentRef?: Ref;
  expandable: boolean;
  expanded: boolean;
}

function getRefOutletEntriesVisitor(
  entries: RefOutletEntry[],
  ref: Ref,
  indent: number,
  path: string,
  expandedObjects: Record<number, PropertyRef[]>,
  expandedPaths: Set<string>,
  type?: 'enumerable' | 'nonenumerable' | 'special',
  label?: string,
  parentRef?: Ref
) {
  const expandable = 'objectId' in ref && ref.objectId !== undefined;
  const expanded = expandedPaths.has(path);

  entries.push({
    ref,
    indent,
    label,
    type,
    path,
    parentRef,
    expanded,
    expandable,
  });

  const objectId = (ref as { objectId: number }).objectId;
  if (expandable && expanded && expandedObjects[objectId]) {
    for (const prop of expandedObjects[objectId]) {
      getRefOutletEntriesVisitor(
        entries,
        prop.val,
        indent + 1,
        `${path}.${prop.keyId}`,
        expandedObjects,
        expandedPaths,
        prop.type,
        prop.key,
        ref
      );
    }
  }
}

function getRefOutletEntries(
  rootRef: Ref,
  state: RefState,
  uiState: RefUiState,
  type?: 'enumerable' | 'nonenumerable' | 'special',
  label?: string
) {
  const entries: RefOutletEntry[] = [];

  getRefOutletEntriesVisitor(
    entries,
    rootRef,
    0,
    'root',
    state.expandedObjects,
    uiState.expandedPaths,
    type,
    label
  );
  return entries;
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
      const entries = getRefOutletEntries(ref, state, uiState, type, label);
      console.log(stateKey);
      return { entries };
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

export function RefOutlet({
  type = 'enumerable',
  label,
  reference,
  stateKey,
}: RefOutletProps) {
  const vm = useSelectorFunction(vmSelector, stateKey, reference, type, label);
  return (
    <>
      {vm.entries.map((entry) => (
        <RefOutletEntry
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
      ))}
    </>
  );
}
