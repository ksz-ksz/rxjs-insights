import { Component } from './container';
import { StoreView } from './store-view';

type ExtractDepState<T> = T extends Component<StoreView<infer U>> ? U : never;

export type Dep = Component<StoreView<unknown>>;
export type Deps = Dep[];

type DepCons<THead extends Dep, TTail extends Deps> = [THead, ...TTail];

export type DepsState<TDeps extends Deps> = TDeps extends [infer TDep]
  ? ExtractDepState<TDep>
  : TDeps extends DepCons<infer THead, infer TTail>
  ? ExtractDepState<THead> & DepsState<TTail>
  : {};

export function getDepsState(deps: StoreView<any>[]) {
  return deps.reduce((acc, dep) => ({ ...acc, ...dep.getState() }), {});
}
