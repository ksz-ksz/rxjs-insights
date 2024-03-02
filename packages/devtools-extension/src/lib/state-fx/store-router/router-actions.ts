import { RouteObject } from './route-object';
import { Location } from './history';
import { ActionTypes, createActions } from '@lib/state-fx/store';
import { RouterState } from './router-store';
import { RouteEvent } from './route-event';
import { RouteCommand } from './route-command';

export interface NavigateCommand {
  location: Location;
  state?: any;
  historyMode?: 'push' | 'replace';
  // TODO: we need a global Encoder defined in order to be able to merge/replace search/hash
  // searchMode?: 'merge' | 'replace';
  // hashMode?: 'merge' | 'replace';
}

export interface NavigationCommand {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routes: RouteObject[];
}

export interface CancelNavigationCommand {
  reason: any;
}

export interface NavigationEvent {
  origin: 'pop' | 'push' | 'replace';
  location: Location;
  state: any;
  key: string;
  routerState: RouterState;
}

export interface NavigationCancelledEvent {
  reason: string;
  routerState: RouterState;
}

export interface RouterActions {
  // commands
  navigate: NavigateCommand;
  startNavigation: NavigationCommand;
  completeCheck: NavigationCommand;
  completePrepare: NavigationCommand;
  completeNavigation: NavigationCommand;
  cancelNavigation: CancelNavigationCommand;
  checkRoute: RouteCommand;
  prepareRoute: RouteCommand;
  commitRoute: RouteCommand;

  // events
  navigationRequested: NavigationEvent;
  navigationStarted: NavigationEvent;
  navigationChecked: NavigationEvent;
  navigationPrepared: NavigationEvent;
  navigationCompleted: NavigationEvent;
  navigationCancelled: NavigationCancelledEvent;
  routeChecked: RouteEvent;
  routePrepared: RouteEvent;
  routeCommitted: RouteEvent;
}

export type RouterActionTypes = ActionTypes<RouterActions>;

export function createRouterActions(namespace: string): RouterActionTypes {
  return createActions<RouterActions>({ namespace });
}
