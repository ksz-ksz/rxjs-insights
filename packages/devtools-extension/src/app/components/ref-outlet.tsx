import {
  ArrayRef,
  CallerRef,
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
  TaskRef,
  TextRef,
  ValueRef,
} from '@app/protocols/refs';
import React, {
  JSXElementConstructor,
  MouseEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Menu, MenuItem, MenuList, styled } from '@mui/material';
import { useDispatch } from '@app/store';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { Indent } from '@app/components/indent';
import { openResourceAvailable } from '@app/features';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';
import { Action } from '@lib/state-fx/store';

interface TagRendererProps<REF extends Ref> {
  reference: REF;
  details?: boolean;
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
    content: '" " attr(data-tags) " #" attr(data-id)',
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
    content: '" " attr(data-tags) " #" attr(data-id)',
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

const CallerSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.insights.caller.secondary,
  '&:before': {
    display: 'inline',
    content: '"⦿ "',
    fontWeight: 900,
    color: theme.insights.caller.primary,
  },
  '&:after': {
    display: 'inline',
    content: '" #" attr(data-id)',
    color: theme.inspector.secondary,
  },
}));

function CallerTag(props: TagRendererProps<CallerRef>) {
  return (
    <CallerSpan data-id={props.reference.id}>{props.reference.name}</CallerSpan>
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
      {props.details && data && DataTagRenderer ? (
        <EventDataSpan>
          <DataTagRenderer reference={data} />
        </EventDataSpan>
      ) : null}
    </EventSpan>
  );
}

const TaskSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.inspector.primary,
  '&:after': {
    display: 'inline',
    content: '" #" attr(data-id)',
    color: theme.inspector.secondary,
  },
}));

function TaskTag(props: TagRendererProps<TaskRef>) {
  return (
    <TaskSpan data-id={props.reference.id}>{props.reference.name}</TaskSpan>
  );
}

const LocationSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  color: theme.inspector.secondary,
  textDecoration: openResourceAvailable ? 'underline' : undefined,
  cursor: openResourceAvailable ? 'pointer' : undefined,
}));

function LocationTag(props: TagRendererProps<LocationRef>) {
  const { file, line, column } = props.reference;
  const shortName = `${file.split('/').at(-1)}:${line}`;
  const longName = `${file}:${line}:${column}`;
  const onOpen = useCallback(
    (event: MouseEvent) => {
      if (openResourceAvailable) {
        event.preventDefault();
        event.stopPropagation();
        chrome.devtools.panels.openResource(file, line - 1, () => {});
      }
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

const StringValueSpan = styled('span')({
  display: 'inline-block',
  maxWidth: '400px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  verticalAlign: 'bottom',
});

function StringTag(props: TagRendererProps<ValueRef>) {
  return (
    <StringSpan>
      <StringValueSpan>{props.reference.value}</StringValueSpan>
    </StringSpan>
  );
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
  caller: CallerTag,
  event: EventTag,
  task: TaskTag,
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

const MonospaceSpan = styled('span')({
  display: 'inline',
  fontFamily: 'Monospace',
});

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
    display: 'inline-block',
    width: '0.6rem',
    content: '"\\00a0"',
    color: theme.inspector.secondary,
    whiteSpace: 'pre',
  },
  '&[data-state=expanded]:before': {
    content: '"▾"',
  },
  '&[data-state=collapsed]:before': {
    content: '"▸"',
  },
  '&:not(:empty):after': {
    display: 'inline',
    content: '":\\00a0"',
    color: theme.inspector.secondary,
  },
}));

const EntryDiv = styled('div')({
  display: 'inline-flex',
  height: '100%',
  textAlign: 'left',
  cursor: 'default',
  flexWrap: 'nowrap',
  whiteSpace: 'nowrap',
});

interface EntryMenuRef {
  onContextMenuOpen(event: MouseEvent): void;
}

interface EntryMenuProps {
  reference: Ref;
  stateKey: string;
  path: string;
}

interface EntryMenuAction {
  label: string;
  action: Action;
}

function getEntryMenuActions(reference: Ref, stateKey: string, path: string) {
  const actions: EntryMenuAction[] = [];

  switch (reference.type) {
    case 'observable':
    case 'subscriber':
      actions.push({
        label: 'Focus in graph',
        action: refOutletContextActions.FocusTarget({ target: reference }),
      });
      if (reference.locations.originalLocation) {
        actions.push({
          label: 'Open source location',
          action: refOutletContextActions.OpenLocation({
            location: reference.locations.originalLocation,
          }),
        });
      }
      if (reference.locations.generatedLocation) {
        actions.push({
          label: 'Open bundle location',
          action: refOutletContextActions.OpenLocation({
            location: reference.locations.generatedLocation,
          }),
        });
      }
      break;
    case 'event':
      actions.push({
        label: 'Focus in events',
        action: refOutletContextActions.FocusEvent({ event: reference }),
      });
      break;
    case 'getter':
      actions.push({
        label: 'Invoke getter',
        action: refOutletActions.InvokeGetter({
          ref: reference,
          stateKey,
          path,
        }),
      });
      break;
  }

  if ('objectId' in reference && reference.objectId !== undefined) {
    actions.push({
      label: 'Show in console',
      action: refOutletContextActions.InspectObjectInConsole({
        objectId: reference.objectId,
      }),
    });
    actions.push({
      label: 'Store as global variable',
      action: refOutletContextActions.StoreObjectAsGlobalVariable({
        objectId: reference.objectId,
      }),
    });
  } else if ('value' in reference) {
    actions.push({
      label: 'Show in console',
      action: refOutletContextActions.InspectValueInConsole({
        value: reference.value,
      }),
    });
    actions.push({
      label: 'Store as global variable',
      action: refOutletContextActions.StoreValueAsGlobalVariable({
        value: reference.value,
      }),
    });
  }
  return actions;
}

const EntryMenu = React.forwardRef<EntryMenuRef, EntryMenuProps>(
  function EntryMenu(props, forwardedRef) {
    const dispatch = useDispatch();
    const [menu, setMenu] = useState<{
      open: boolean;
      position: { top: number; left: number };
      actions: EntryMenuAction[];
    }>({ open: false, position: { top: 0, left: 0 }, actions: [] });

    const onContextMenuClose = useCallback(
      (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setMenu({ ...menu, open: false });
      },
      [menu]
    );

    React.useImperativeHandle(
      forwardedRef,
      (): EntryMenuRef => ({
        onContextMenuOpen: (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          setMenu({
            open: true,
            position: { top: event.clientY, left: event.clientX },
            actions: getEntryMenuActions(
              props.reference,
              props.stateKey,
              props.path
            ),
          });
        },
      }),
      [props.reference]
    );

    return (
      <Menu
        open={menu.open}
        anchorReference="anchorPosition"
        anchorPosition={menu.position}
        onClose={onContextMenuClose}
      >
        <MenuList dense>
          {menu.actions.length !== 0 ? (
            menu.actions.map(({ label, action }) => (
              <MenuItem
                key={label}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  dispatch(action);
                  setMenu({ ...menu, open: false });
                }}
              >
                {label}
              </MenuItem>
            ))
          ) : (
            <MenuItem
              disabled
              onClick={() => {
                setMenu({ ...menu, open: false });
              }}
            >
              No actions available
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    );
  }
);

function useEntryMenu() {
  const ref = useRef<EntryMenuRef | null>(null);
  const onContextMenuOpen = useCallback((event: MouseEvent) => {
    ref.current?.onContextMenuOpen(event);
  }, []);

  return { ref, onContextMenuOpen };
}

function ObjectRefOutletRenderer(
  props: RefOutletRendererProps<Extract<Ref, { objectId?: number }>>
) {
  const menu = useEntryMenu();
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
    <>
      {(props.menu ?? true) && (
        <EntryMenu
          ref={menu.ref}
          reference={props.reference}
          stateKey={props.stateKey}
          path={props.path}
        />
      )}
      <EntryDiv onClick={onToggle} onContextMenu={menu.onContextMenuOpen}>
        <Indent indent={props.indent} />
        <LabelSpan
          data-state={props.expanded ? 'expanded' : 'collapsed'}
          data-type={props.type}
        >
          {props.label}
        </LabelSpan>
        <TagRenderer
          reference={props.reference}
          details={props.details ?? true}
        />
      </EntryDiv>
    </>
  );
}

function ValueRefOutletRenderer(props: RefOutletRendererProps) {
  const menu = useEntryMenu();
  const TagRenderer = getTagRenderer(props.reference.type);

  return (
    <>
      {(props.menu ?? true) && (
        <EntryMenu
          ref={menu.ref}
          reference={props.reference}
          stateKey={props.stateKey}
          path={props.path}
        />
      )}
      <EntryDiv onContextMenu={menu.onContextMenuOpen}>
        <Indent indent={props.indent} />
        <LabelSpan data-type={props.type}>{props.label}</LabelSpan>
        <TagRenderer
          reference={props.reference}
          details={props.details ?? true}
        />
      </EntryDiv>
    </>
  );
}

function GetterRefOutletRenderer(props: RefOutletRendererProps<GetterRef>) {
  const menu = useEntryMenu();
  const dispatch = useDispatch();
  const onInvoke = useCallback(() => {
    dispatch(
      refOutletActions.InvokeGetter({
        ref: props.reference,
        stateKey: props.stateKey,
        path: props.path,
      })
    );
  }, [props.reference, props.stateKey, props.path]);

  return (
    <>
      {(props.menu ?? true) && (
        <EntryMenu
          ref={menu.ref}
          reference={props.reference}
          stateKey={props.stateKey}
          path={props.path}
        />
      )}
      <EntryDiv onContextMenu={menu.onContextMenuOpen}>
        <Indent indent={props.indent} />
        <LabelSpan data-type={props.type}>{props.label}</LabelSpan>
        <a onClick={onInvoke}>
          <MonospaceSpan sx={{ title: 'Invoke getter' }}>(...)</MonospaceSpan>
        </a>
      </EntryDiv>
    </>
  );
}

export interface RefOutletEntryProps {
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string | number;
  indent: number;
  stateKey: string;
  path: string;
  reference: Ref;
  expanded: boolean;
  expandable: boolean;
}

export interface RefOutletRendererProps<REF extends Ref = Ref> {
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string | number;
  details?: boolean;
  menu?: boolean;
  indent: number;
  stateKey: string;
  path: string;
  reference: REF;
  expanded: boolean;
  expandable: boolean;
}

export function RefOutletEntryRenderer({
  reference,
  ...props
}: RefOutletEntryProps) {
  if (reference.type === 'getter') {
    return <GetterRefOutletRenderer reference={reference} {...props} />;
  } else if ('objectId' in reference && reference.objectId !== undefined) {
    return <ObjectRefOutletRenderer reference={reference} {...props} />;
  } else {
    return <ValueRefOutletRenderer reference={reference} {...props} />;
  }
}

export interface RefSummaryOutletProps {
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string;
  details?: boolean;
  reference: Ref;
}

export function RefSummaryOutlet({
  reference,
  type,
  label,
  details,
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
      details={details}
      menu={false}
    />
  );
}
