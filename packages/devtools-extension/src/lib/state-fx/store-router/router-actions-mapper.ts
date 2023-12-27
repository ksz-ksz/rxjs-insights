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

export function createRouterActionsMapper(
  name: string,
  actions: Actions,
  routerActions: RouterActionTypes,
  routerStore: Store<RouterState>
) {
  const deps = { store: routerStore };
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
      startCheckPhase: mapAction(
        routerActions.startCheckPhase,
        routerActions.checkPhaseStarted,
        mapNavigationCommandPayload,
        deps
      ),
      completeCheckPhase: mapAction(
        routerActions.completeCheckPhase,
        routerActions.checkPhaseCompleted,
        mapNavigationCommandPayload,
        deps
      ),
      startCommitPhase: mapAction(
        routerActions.startCommitPhase,
        routerActions.commitPhaseStarted,
        mapNavigationCommandPayload,
        deps
      ),
      completeCommitPhase: mapAction(
        routerActions.completeCommitPhase,
        routerActions.commitPhaseCompleted,
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
  { location, state, historyMode: origin = 'push' }: NavigateCommand,
  { store }: { store: Store<RouterState> }
): NavigationEvent {
  return {
    origin,
    location,
    state,
    key: getRandomId(),
    routerState: store.getState(),
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
