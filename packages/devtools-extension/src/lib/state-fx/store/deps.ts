import { Component } from './container';
import { Store } from './store';

type ExtractDepState<T> = T extends Component<Store<infer U>> ? U : never;

export type Dep = Component<Store<unknown>>;
export type Deps = Dep[];

type DepCons<THead extends Dep, TTail extends Deps> = [THead, ...TTail];

export type DepsState<TDeps extends Deps> = TDeps extends [infer TDep]
  ? ExtractDepState<TDep>
  : TDeps extends DepCons<infer THead, infer TTail>
  ? ExtractDepState<THead> & DepsState<TTail>
  : {};

export function getDepsState(deps: Store<any>[]) {
  return deps.reduce((acc, dep) => ({ ...acc, ...dep.getState() }), {});
}
