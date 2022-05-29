import {
  ArrayRef,
  FunctionRef,
  GetterRef,
  MapEntryRef,
  MapRef,
  ObjectRef,
  Ref,
  SetRef,
  SymbolRef,
  ValueRef,
} from '@app/protocols/refs';
import React, { JSXElementConstructor, useCallback, useMemo } from 'react';
import { styled } from '@mui/material';
import { getRefState } from '@app/selectors/refs-selectors';
import { useDispatch, useSelector } from '@app/store';
import { refOutletActions } from '@app/actions/ref-outlet-actions';

interface TagRendererProps<REF extends Ref> {
  reference: REF;
}

const ObjectSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.palette.inspector.val.main,
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
  color: theme.palette.inspector.val.main,
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
  color: theme.palette.inspector.val.main,
  '&:before': {
    display: 'inline',
    content: '"f "',
    color: theme.palette.inspector.val.function,
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
  color: theme.palette.inspector.val.main,
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
  color: theme.palette.inspector.val.main,
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

function EmptyTag() {
  return null;
}

const StringSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.palette.inspector.val.string,
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
  color: theme.palette.inspector.val.number,
}));

function NumberTag(props: TagRendererProps<ValueRef>) {
  return <NumberSpan>{String(props.reference.value)}</NumberSpan>;
}

const BigintSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.palette.inspector.val.number,
  '&:after': {
    display: 'inline',
    content: '"n"',
  },
}));

const BooleanSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.palette.inspector.val.boolean,
}));

function BooleanTag(props: TagRendererProps<ValueRef>) {
  return <BooleanSpan>{String(props.reference.value)}</BooleanSpan>;
}

function BigintTag(props: TagRendererProps<ValueRef>) {
  return <BigintSpan>{props.reference.value}</BigintSpan>;
}

const SymbolSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.palette.inspector.val.symbol,
}));

function SymbolTag(props: TagRendererProps<SymbolRef>) {
  return <SymbolSpan>{props.reference.name}</SymbolSpan>;
}

const UndefinedSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.palette.inspector.val.undefined,
}));

function UndefinedTag() {
  return <UndefinedSpan>undefined</UndefinedSpan>;
}

const NullSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.palette.inspector.val.null,
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
  entries: EmptyTag,
  string: StringTag,
  number: NumberTag,
  boolean: BooleanTag,
  bigint: BigintTag,
  symbol: SymbolTag,
  undefined: UndefinedTag,
  null: NullTag,
  observable: ObjectTag,
  subscriber: ObjectTag,
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
    color: theme.palette.inspector.key.enumerable,
  },
  '&[data-type=nonenumerable]': {
    color: theme.palette.inspector.key.nonenumerable,
  },
  '&[data-type=special]': {
    color: theme.palette.inspector.key.special,
  },
}));

interface ObjectRefOutletProps {
  type: 'enumerable' | 'nonenumerable' | 'special';
  label?: string | number;
  reference: Extract<Ref, { refId: number }>;
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
        <MonospaceSpan>{refState.expanded ? '▾' : '▸'}</MonospaceSpan>
        <LabelSpan
          data-type={props.type}
          sx={{ marginLeft: '1ch', marginRight: props.label ? '1ch' : 0 }}
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
      <LabelSpan
        data-type={props.type}
        sx={{ marginLeft: '2ch', marginRight: props.label ? '1ch' : 0 }}
      >
        {props.label}
      </LabelSpan>
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
        <LabelSpan
          data-type={props.type}
          sx={{ marginLeft: '2ch', marginRight: props.label ? '1ch' : 0 }}
        >
          {props.label}
        </LabelSpan>
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
  switch (reference.type) {
    case 'undefined':
    case 'string':
    case 'number':
    case 'boolean':
    case 'bigint':
    case 'null':
    case 'symbol':
      return <ValueRefOutlet type={type} label={label} reference={reference} />;
    case 'object':
    case 'array':
    case 'function':
    case 'set':
    case 'map':
    case 'map-entry':
    case 'entries':
    case 'observable':
    case 'subscriber':
      return (
        <ObjectRefOutlet type={type} label={label} reference={reference} />
      );
    case 'getter':
      return (
        <GetterRefOutlet type={type} label={label} reference={reference} />
      );
  }
}
