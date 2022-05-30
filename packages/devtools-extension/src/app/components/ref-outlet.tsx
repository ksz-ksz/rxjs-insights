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
  useMemo,
} from 'react';
import { styled } from '@mui/material';
import { getRefState } from '@app/selectors/refs-selectors';
import { useDispatch, useSelector } from '@app/store';
import { refOutletActions } from '@app/actions/ref-outlet-actions';

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
  color: theme.inspector.primary,
  '&:after': {
    display: 'inline',
    content: '"{ " attr(data-key) " => " attr(data-val) " }"',
  },
}));

function MapEntryTag(props: TagRendererProps<MapEntryRef>) {
  return (
    <MapEntrySpan
      data-key={props.reference.keyName}
      data-val={props.reference.valName}
    />
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

interface ObjectRefOutletProps {
  type: 'enumerable' | 'nonenumerable' | 'special';
  label?: string | number;
  reference: Extract<Ref, { refId?: number }> & { refId: number };
}

const RefOutletDiv = styled('div')({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'start',
});

const RefOutletLabelDiv = styled('div')({
  display: 'inline-block',
  textAlign: 'left',
  cursor: 'default',
});

const RefOutletPropsDiv = styled('div')({
  display: 'inline-flex',
  flexDirection: 'column',
  marginLeft: '2ch',
});

function ObjectRefOutlet(props: ObjectRefOutletProps) {
  const refStateSelector = useMemo(
    () => getRefState(props.reference.refId),
    [props.reference.refId]
  );
  const refState = useSelector(refStateSelector);
  const dispatch = useDispatch();
  const onToggle = useCallback(() => {
    if (refState.expanded) {
      dispatch(refOutletActions.Collapse({ refId: props.reference.refId }));
    } else {
      dispatch(refOutletActions.Expand({ refId: props.reference.refId }));
    }
  }, [refState, props.reference.refId]);
  const TagRenderer = getTagRenderer(props.reference.type);

  return (
    <RefOutletDiv>
      <RefOutletLabelDiv onClick={onToggle}>
        <LabelSpan
          data-state={refState.expanded ? 'expanded' : 'collapsed'}
          data-type={props.type}
        >
          {props.label}
        </LabelSpan>
        <TagRenderer reference={props.reference} />
      </RefOutletLabelDiv>
      {refState.expanded && refState.props ? (
        <RefOutletPropsDiv>
          {refState.props.map((prop) => (
            <RefOutlet label={prop.key} type={prop.type} reference={prop.val} />
          ))}
        </RefOutletPropsDiv>
      ) : null}
    </RefOutletDiv>
  );
}

interface ValueRefOutletProps {
  type: 'enumerable' | 'nonenumerable' | 'special';
  label?: string | number;
  reference: Ref;
}

function ValueRefOutlet(props: ValueRefOutletProps) {
  const TagRenderer = getTagRenderer(props.reference.type);

  return (
    <RefOutletLabelDiv>
      <LabelSpan data-type={props.type}>{props.label}</LabelSpan>
      <TagRenderer reference={props.reference} />
    </RefOutletLabelDiv>
  );
}

interface GetterRefOutletProps {
  type: 'enumerable' | 'nonenumerable' | 'special';
  label?: string | number;
  reference: GetterRef;
}

function GetterRefOutlet(props: GetterRefOutletProps) {
  const refStateSelector = useMemo(
    () => getRefState(props.reference.refId),
    [props.reference.refId]
  );
  const refState = useSelector(refStateSelector);
  const dispatch = useDispatch();
  const onInvoke = useCallback(() => {
    dispatch(refOutletActions.InvokeGetter({ refId: props.reference.refId }));
  }, [props.reference.refId]);

  if (refState.ref) {
    return (
      <RefOutlet
        type={props.type}
        label={props.label}
        reference={refState.ref}
      />
    );
  } else {
    return (
      <RefOutletLabelDiv>
        <LabelSpan data-type={props.type}>{props.label}</LabelSpan>
        <a onClick={onInvoke}>
          <MonospaceSpan sx={{ title: 'Invoke getter' }}>(...)</MonospaceSpan>
        </a>
      </RefOutletLabelDiv>
    );
  }
}

export interface RefOutletProps {
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string | number;
  reference: Ref;
}

export function RefOutlet({
  type = 'enumerable',
  label,
  reference,
}: RefOutletProps) {
  if (reference.type === 'getter') {
    return <GetterRefOutlet type={type} label={label} reference={reference} />;
  } else if ('refId' in reference && reference.refId !== undefined) {
    const referenceWithId = reference as typeof reference & {
      refId: number;
    };
    return (
      <ObjectRefOutlet type={type} label={label} reference={referenceWithId} />
    );
  } else {
    return <ValueRefOutlet type={type} label={label} reference={reference} />;
  }
}
