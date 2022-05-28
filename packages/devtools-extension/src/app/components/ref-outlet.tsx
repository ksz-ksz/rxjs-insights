import {
  ArrayRef,
  FunctionRef,
  GetterRef,
  MapRef,
  NullRef,
  ObjectRef,
  ObservableRef,
  Ref,
  SetRef,
  SubscriberRef,
  SymbolRef,
  UndefinedRef,
  ValueRef,
} from '@app/protocols/refs';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { JSXElementConstructor } from 'react';
import { Box, Typography } from '@mui/material';
import { pink } from '@mui/material/colors';
import { refState } from '@app/selectors/refs-selectors';
import { useDispatch, useSelector } from '@app/store';
import { PropertyRefState, RefState } from '@app/store/refs';
import { refOutletActions } from '@app/actions/ref-outlet-actions';

interface TagRendererProps<REF extends Ref> {
  reference: REF;
}

interface RefRendererProps<REF extends Ref> {
  label: string;
  primary: boolean;
  refState: RefState<REF>;
  tagRenderer: JSXElementConstructor<TagRendererProps<REF>>;
}

interface BaseRefRendererProps {
  label: string;
  primary: boolean;
  tag: ReactNode;
  expandable: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children?: PropertyRefState[];
}

function BaseRefRenderer(props: BaseRefRendererProps) {
  return (
    <Box display="block">
      <Box onClick={() => props.onExpandedChange?.(!props.expanded)}>
        {props.expandable ? (
          <Typography
            sx={{
              display: 'inline',
              fontFamily: 'Monospace',
            }}
          >
            {props.expanded ? '▾' : '▸'}
          </Typography>
        ) : null}
        <Typography
          sx={{
            display: 'inline',
            marginLeft: props.expandable ? '1ch' : '2ch',
            marginRight: '1ch',
            color: props.primary ? pink.A100 : pink.A400,
            fontFamily: 'Monospace',
          }}
        >
          {props.label}:
        </Typography>
        {props.tag}
      </Box>
      {props.expanded && props.children ? (
        <Box marginLeft="2ch">
          {props.children.map((child) => (
            <RefOutlet
              label={child.key}
              primary={child.enumerable}
              refId={child.val}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
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

function ObjectRefRenderer(props: RefRendererProps<ObjectRef>) {
  const { refState } = props;
  const dispatch = useDispatch();
  const onExpandedChange = useCallback(
    (expanded: boolean) => {
      if (expanded) {
        dispatch(refOutletActions.Expand({ refId: refState.ref.refId }));
      } else {
        dispatch(refOutletActions.Collapse({ refId: refState.ref.refId }));
      }
    },
    [refState.ref.refId]
  );
  const TagRenderer = props.tagRenderer;
  return (
    <BaseRefRenderer
      label={props.label}
      primary={props.primary}
      tag={<TagRenderer reference={refState.ref} />}
      expandable={true}
      expanded={refState.expanded}
      onExpandedChange={onExpandedChange}
      children={refState.children?.props}
    />
  );
}

function ValueRefRenderer(props: RefRendererProps<ValueRef>) {
  const { refState } = props;
  const TagRenderer = props.tagRenderer;
  return (
    <BaseRefRenderer
      label={props.label}
      primary={props.primary}
      tag={<TagRenderer reference={refState.ref} />}
      expandable={false}
    />
  );
}

function ArrayRefRenderer(props: RefRendererProps<ArrayRef>) {
  return 'ArrayRefRenderer';
}

function FunctionRefRenderer(props: RefRendererProps<FunctionRef>) {
  return 'FunctionRefRenderer';
}

function SetRefRenderer(props: RefRendererProps<SetRef>) {
  return 'SetRefRenderer';
}

function MapRefRenderer(props: RefRendererProps<MapRef>) {
  return 'MapRefRenderer';
}

function GetterRefRenderer(props: RefRendererProps<GetterRef>) {
  return 'GetterRefRenderer';
}

function SymbolRefRenderer(props: RefRendererProps<SymbolRef>) {
  return 'SymbolRefRenderer';
}

function UndefinedRefRenderer(props: RefRendererProps<UndefinedRef>) {
  return 'UndefinedRefRenderer';
}

function NullRefRenderer(props: RefRendererProps<NullRef>) {
  return 'NullRefRenderer';
}

function ObservableRefRenderer(props: RefRendererProps<ObservableRef>) {
  return 'ObservableRefRenderer';
}

function SubscriberRefRenderer(props: RefRendererProps<SubscriberRef>) {
  return 'SubscriberRefRenderer';
}

const refRenderers: Record<
  string,
  JSXElementConstructor<RefRendererProps<any>>
> = {
  object: ObjectRefRenderer,
  array: ObjectRefRenderer,
  function: ObjectRefRenderer,
  set: ObjectRefRenderer,
  map: ObjectRefRenderer,
  getter: GetterRefRenderer,
  value: ValueRefRenderer,
  symbol: ValueRefRenderer,
  undefined: ValueRefRenderer,
  null: ValueRefRenderer,
  observable: ObjectRefRenderer,
  subscriber: ObjectRefRenderer,
};

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
  value: ValueTag,
  symbol: SymbolTag,
  undefined: UndefinedTag,
  null: NullTag,
  // observable: ObjectTag,
  // subscriber: SubscriberRefRenderer,
};

export interface RefOutletProps {
  label: string;
  primary: boolean;
  refId: number;
}

export function RefOutlet(props: RefOutletProps) {
  const refStateSelector = useMemo(() => refState(props.refId), [props.refId]);
  const state = useSelector(refStateSelector);
  const RefRenderer = refRenderers[state.ref.type];
  const TagRenderer = tagRenderers[state.ref.type];
  console.log('RefRenderer', { RefRenderer, TagRenderer, props, state });

  return (
    <RefRenderer
      label={props.label}
      primary={props.primary}
      refState={state}
      tagRenderer={TagRenderer}
    />
  );
}
