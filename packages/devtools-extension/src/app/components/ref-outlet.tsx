import {
  ArrayRef,
  FunctionRef,
  GetterRef,
  MapRef,
  NullRef,
  ObjectRef,
  Ref,
  SetRef,
  SymbolRef,
  UndefinedRef,
  ValueRef,
} from '@app/protocols/refs';
import React, { JSXElementConstructor, useCallback, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { grey, pink } from '@mui/material/colors';
import { getRefState } from '@app/selectors/refs-selectors';
import { useDispatch, useSelector } from '@app/store';
import { refOutletActions } from '@app/actions/ref-outlet-actions';

function getLabelColor(type: 'enumerable' | 'nonenumerable' | 'special') {
  return type === 'enumerable'
    ? pink['200']
    : type === 'nonenumerable'
    ? pink['100']
    : grey['500'];
}

interface TagRendererProps<REF extends Ref> {
  reference: REF;
}

function ObjectTag(props: { reference: ObjectRef }) {
  return (
    <Typography
      sx={{
        display: 'inline',
        fontFamily: 'Monospace',
      }}
    >
      {props.reference.name}
    </Typography>
  );
}

function ArrayTag(props: TagRendererProps<ArrayRef>) {
  return (
    <Typography
      sx={{
        display: 'inline',
        fontFamily: 'Monospace',
      }}
    >
      {props.reference.name} ({props.reference.length})
    </Typography>
  );
}

function FunctionTag(props: TagRendererProps<FunctionRef>) {
  return (
    <Typography
      sx={{
        display: 'inline',
        fontFamily: 'Monospace',
      }}
    >
      f {props.reference.name}()
    </Typography>
  );
}

function SetTag(props: TagRendererProps<SetRef>) {
  return (
    <Typography
      sx={{
        display: 'inline',
        fontFamily: 'Monospace',
      }}
    >
      {props.reference.name} ({props.reference.size})
    </Typography>
  );
}

function MapTag(props: TagRendererProps<MapRef>) {
  return (
    <Typography
      sx={{
        display: 'inline',
        fontFamily: 'Monospace',
      }}
    >
      {props.reference.name} ({props.reference.size})
    </Typography>
  );
}

function ValueTag(props: TagRendererProps<ValueRef>) {
  return (
    <Typography
      sx={{
        display: 'inline',
        fontFamily: 'Monospace',
      }}
    >
      {props.reference.value}
    </Typography>
  );
}

function SymbolTag(props: TagRendererProps<SymbolRef>) {
  return (
    <Typography
      sx={{
        display: 'inline',
        fontFamily: 'Monospace',
      }}
    >
      {props.reference.name}
    </Typography>
  );
}

function UndefinedTag(props: TagRendererProps<UndefinedRef>) {
  return (
    <Typography
      sx={{
        display: 'inline',
        fontFamily: 'Monospace',
      }}
    >
      undefined
    </Typography>
  );
}

function NullTag(props: TagRendererProps<NullRef>) {
  return (
    <Typography
      sx={{
        display: 'inline',
        fontFamily: 'Monospace',
      }}
    >
      null
    </Typography>
  );
}

const tagRenderers: Record<
  string,
  JSXElementConstructor<TagRendererProps<any>>
> = {
  object: ObjectTag,
  array: ArrayTag,
  function: FunctionTag,
  set: SetTag,
  map: MapTag,
  // getter: GetterTag,
  string: ValueTag,
  number: ValueTag,
  boolean: ValueTag,
  bigint: ValueTag,
  symbol: SymbolTag,
  undefined: UndefinedTag,
  null: NullTag,
  // observable: ObjectTag,
  // subscriber: SubscriberRefRenderer,
};

function getTagRenderer(type: string) {
  const tagRenderer = tagRenderers[type];
  if (tagRenderer) {
    return tagRenderer;
  } else {
    throw new Error(`TagRenderer not found for type '${type}'.`);
  }
}

export interface RefOutletProps {
  type: 'enumerable' | 'nonenumerable' | 'special';
  label: string | number;
  reference: Ref;
}

export interface ObjectRefOutletProps {
  type: 'enumerable' | 'nonenumerable' | 'special';
  label: string | number;
  reference: Extract<Ref, { refId: number }>;
}

export interface ValueRefOutletProps {
  type: 'enumerable' | 'nonenumerable' | 'special';
  label: string | number;
  reference: Ref;
}

export interface GetterRefOutletProps {
  type: 'enumerable' | 'nonenumerable' | 'special';
  label: string | number;
  reference: GetterRef;
}

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
    <Box display="block">
      <Box onClick={onToggle}>
        <Typography
          sx={{
            display: 'inline',
            fontFamily: 'Monospace',
          }}
        >
          {refState.expanded ? '▾' : '▸'}
        </Typography>
        <Typography
          sx={{
            display: 'inline',
            marginLeft: '1ch',
            marginRight: '1ch',
            color: getLabelColor(props.type),
            fontFamily: 'Monospace',
          }}
        >
          {props.label}:
        </Typography>
        <TagRenderer reference={props.reference} />
      </Box>
      {refState.expanded && refState.props ? (
        <Box marginLeft="2ch">
          {refState.props.map((prop) => (
            <RefOutlet label={prop.key} type={prop.type} reference={prop.val} />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

function ValueRefOutlet(props: ValueRefOutletProps) {
  const TagRenderer = getTagRenderer(props.reference.type);

  return (
    <Box display="block">
      <Box>
        <Typography
          sx={{
            display: 'inline',
            marginLeft: '2ch',
            marginRight: '1ch',
            color: getLabelColor(props.type),
            fontFamily: 'Monospace',
          }}
        >
          {props.label}:
        </Typography>
        <TagRenderer reference={props.reference} />
      </Box>
    </Box>
  );
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
      <Box display="block">
        <Box>
          <Typography
            sx={{
              display: 'inline',
              marginLeft: '2ch',
              marginRight: '1ch',
              color: getLabelColor(props.type),
              fontFamily: 'Monospace',
            }}
          >
            {props.label}:
          </Typography>
          <a onClick={onInvoke}>
            <Typography
              sx={{
                display: 'inline',
                fontFamily: 'Monospace',
                title: 'Invoke getter',
              }}
            >
              (...)
            </Typography>
          </a>
        </Box>
      </Box>
    );
  }
}

export function RefOutlet(props: RefOutletProps) {
  switch (props.reference.type) {
    case 'undefined':
    case 'string':
    case 'number':
    case 'boolean':
    case 'bigint':
    case 'null':
    case 'symbol':
      return (
        <ValueRefOutlet
          type={props.type}
          label={props.label}
          reference={props.reference}
        />
      );
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
        <ObjectRefOutlet
          type={props.type}
          label={props.label}
          reference={props.reference}
        />
      );
    case 'getter':
      return (
        <GetterRefOutlet
          type={props.type}
          label={props.label}
          reference={props.reference}
        />
      );
  }
}
