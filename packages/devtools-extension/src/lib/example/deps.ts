import { Component } from './container';
import { StoreView } from './store-view';
import { Intersection } from '@lib/store';

type ExtractStoreViewComponentState<T> = T extends Component<StoreView<infer U>>
  ? U
  : never;

export type Deps = Component<StoreView<unknown>>[];

export type DepsType<TDeps extends Deps> = Intersection<
  ExtractStoreViewComponentState<TDeps[number]>
>;

export function getDepsState(deps: StoreView<any>[]) {
  return deps.reduce((acc, dep) => ({ ...acc, ...dep.getState() }), {});
}
