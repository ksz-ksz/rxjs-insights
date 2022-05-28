import { createReducer, Slice } from '@lib/store';
import { PropertyRef, Ref } from '@app/protocols/refs';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { refsActions } from '@app/actions/refs-actions';

export interface RefState {
  expanded?: boolean;
  props?: PropertyRef[];
  ref?: Ref; // resolved getter ref
}

export interface RefsState {
  refs: Record<number, RefState>;
}

export type RefsSlice = Slice<'refs', RefsState>;

export const refsReducer = createReducer('refs', {
  refs: {},
} as RefsState)
  .add(refOutletActions.Expand, (state, action) => {
    const ref = state.refs[action.payload.refId];
    if (ref) {
      ref.expanded = true;
    } else {
      state.refs[action.payload.refId] = { expanded: true };
    }
  })
  .add(refOutletActions.Collapse, (state, action) => {
    const ref = state.refs[action.payload.refId];
    if (ref) {
      ref.expanded = false;
    } else {
      state.refs[action.payload.refId] = { expanded: false };
    }
  })
  .add(refsActions.PropsLoaded, (state, action) => {
    const ref = state.refs[action.payload.refId];
    if (ref) {
      ref.props = action.payload.props;
    } else {
      state.refs[action.payload.refId] = {
        props: action.payload.props,
      };
    }
  })
  .add(refsActions.RefLoaded, (state, action) => {
    const ref = state.refs[action.payload.refId];
    if (ref) {
      ref.ref = action.payload.ref;
    } else {
      state.refs[action.payload.refId] = {
        ref: action.payload.ref,
      };
    }
  });
