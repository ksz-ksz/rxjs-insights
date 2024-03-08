import { Actions, createEffect, Store } from '@lib/state-fx/store';
import {
  CancelNavigationCommand,
  NavigateCommand,
  NavigationCancelledEvent,
  NavigationCommand,
  NavigationEvent,
  RouterActionTypes,
} from './router-actions';
import { RouterState } from './router-store';
import { mapAction } from '../store-query/map-action';
import { getRandomId } from './random-id';
import { Router } from './router';

export function createRouterActionsMapper(
  name: string,
  actions: Actions,
  routerActions: RouterActionTypes,
  routerStore: Store<RouterState>,
  router: Router<unknown>
) {
  const deps = { store: routerStore, router };
  return createEffect(actions, {
    name,
    effects: {
      navigate: mapAction(
        routerActions.navigate,
        routerActions.navigationRequested,
        mapNavigateCommandPayload,
        deps
      ),
      startNavigation: mapAction(
        routerActions.startNavigation,
        routerActions.navigationStarted,
        mapNavigationCommandPayload,
        deps
      ),
      completeCheckPhase: mapAction(
        routerActions.completeCheck,
        routerActions.navigationChecked,
        mapNavigationCommandPayload,
        deps
      ),
      completePreparePhase: mapAction(
        routerActions.completePrepare,
        routerActions.navigationPrepared,
        mapNavigationCommandPayload,
        deps
      ),
      completeNavigation: mapAction(
        routerActions.completeNavigation,
        routerActions.navigationCompleted,
        mapNavigationCommandPayload,
        deps
      ),
      cancelNavigation: mapAction(
        routerActions.cancelNavigation,
        routerActions.navigationCancelled,
        mapNavigationCancelledCommandPayload,
        deps
      ),
    },
  });
}

function mapNavigateCommandPayload(
  {
    location,
    state,
    historyMode: origin = 'push',
    searchMode = 'replace',
    hashMode = 'replace',
  }: NavigateCommand,
  { store, router }: { store: Store<RouterState>; router: Router<unknown> }
): NavigationEvent {
  const routerState = store.getState();
  return {
    origin,
    location: {
      pathname: location.pathname,
      search:
        searchMode === 'replace'
          ? location.search
          : router.searchMerger.merge(
              routerState.location.search,
              location.search
            ) ?? '',
      hash:
        hashMode === 'replace'
          ? location.hash
          : router.hashMerger.merge(routerState.location.hash, location.hash) ??
            '',
    },
    state,
    key: getRandomId(),
    routerState,
  };
}

function mapNavigationCommandPayload(
  { origin, location, state, key }: NavigationCommand,
  { store }: { store: Store<RouterState> }
): NavigationEvent {
  return {
    origin,
    location,
    state,
    key,
    routerState: store.getState(),
  };
}

function mapNavigationCancelledCommandPayload(
  { reason }: CancelNavigationCommand,
  { store }: { store: Store<RouterState> }
): NavigationCancelledEvent {
  return {
    reason,
    routerState: store.getState(),
  };
}
