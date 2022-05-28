import { createReducer, Slice } from '@lib/store';
import { insightsActions } from '@app/actions/insights-actions';
import { Ref } from '@app/protocols/refs';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { refsActions } from '@app/actions/refs-actions';

export interface PropertyRefState {
  key: string;
  val: number;
  enumerable: boolean;
}

export interface RefState<REF extends Ref = Ref> {
  ref: REF;
  expanded: boolean;
  children?: {
    props: PropertyRefState[];
    proto: number;
    setEntries?: number[];
    mapEntries?: [number, number][];
  };
}

export interface RefsState {
  refs: Record<number, RefState>;
}

export type RefsSlice = Slice<'refs', RefsState>;

function addRef(state: RefsState, ref: Ref) {
  state.refs[ref.refId] = {
    ref: ref,
    expanded: false,
  };
}

export const refsReducer = createReducer('refs', {
  refs: {},
} as RefsState)
  .add(insightsActions.ObservableInfoLoaded, (state, action) => {
    const { info } = action.payload;
    if (info !== undefined) {
      addRef(state, info.target);
    }
  })
  .add(refOutletActions.Expand, (state, action) => {
    state.refs[action.payload.refId].expanded = true;
  })
  .add(refOutletActions.Collapse, (state, action) => {
    state.refs[action.payload.refId].expanded = false;
  })
  .add(refsActions.RefChildrenLoaded, (state, action) => {
    const { refId, children } = action.payload;
    const ref = state.refs[refId];

    ref.children = {} as any;

    addRef(state, children.proto);
    ref.children!.proto = children.proto.refId;

    ref.children!.props = [];
    for (const prop of children.props) {
      addRef(state, prop.val);
      ref.children!.props.push({
        key: prop.key,
        val: prop.val.refId,
        enumerable: prop.enumerable,
      });
    }

    if ('setEntries' in children) {
      ref.children!.setEntries = [];
      for (const entry of children.setEntries) {
        addRef(state, entry);
        ref.children!.setEntries.push(entry.refId);
      }
    }

    if ('mapEntries' in children) {
      ref.children!.mapEntries = [];
      for (const [key, val] of children.mapEntries) {
        addRef(state, key);
        addRef(state, val);
        ref.children!.mapEntries.push([key.refId, val.refId]);
      }
    }
  });
