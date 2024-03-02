import { Route, RouteConfigDef } from '@lib/state-fx/store-router';
import { ReactRouterData } from './react-router-data';

export type ReactRouterConfig<TRoute extends Route = Route> = RouteConfigDef<
  TRoute,
  ReactRouterData
>;
