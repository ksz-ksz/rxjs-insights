import { Action, ActionFactory, ActionFactoryPayload } from './action';
import {
  filter,
  ignoreElements,
  Observable,
  OperatorFunction,
  pipe,
  tap,
  UnaryFunction,
} from 'rxjs';
import { Selector } from './selector';
import { SelectionObserver } from './selection-observer';

export function filterActions<PAYLOAD>(
  actionFactory: ActionFactory<PAYLOAD>,
  predicate?: (action: Action<PAYLOAD>) => boolean
): OperatorFunction<Action<any>, Action<PAYLOAD>>;
export function filterActions<FACTORIES extends ActionFactory<any>[]>(
  actionFactories: FACTORIES,
  predicate?: (action: Action<ActionFactoryPayload<Item<FACTORIES>>>) => boolean
): OperatorFunction<Action<any>, Action<ActionFactoryPayload<Item<FACTORIES>>>>;
export function filterActions(
  actionFactory: ActionFactory<any> | ActionFactory<any>[],
  predicate: (action: any) => boolean = () => true
) {
  if (Array.isArray(actionFactory)) {
    return filterActionsAll(actionFactory, predicate);
  } else {
    return filterActionsOne(actionFactory, predicate);
  }
}

function filterActionsOne<PAYLOAD>(
  actionFactory: ActionFactory<PAYLOAD>,
  predicate: (action: Action<PAYLOAD>) => boolean = () => true
) {
  return filter(
    (action) => action.type == actionFactory.type && predicate(action)
  ) as OperatorFunction<Action<any>, Action<PAYLOAD>>;
}

function filterActionsAll<FACTORIES extends ActionFactory<any>[]>(
  actionFactories: FACTORIES,
  predicate: (
    action: Action<ActionFactoryPayload<Item<FACTORIES>>>
  ) => boolean = () => true
) {
  return filter(
    (action) =>
      actionFactories.some(
        (actionFactory) => action.type == actionFactory.type
      ) && predicate(action)
  ) as OperatorFunction<
    Action<any>,
    Action<ActionFactoryPayload<Item<FACTORIES>>>
  >;
}

export type Item<T> = T extends (infer U)[] ? U : never;

export function effect<T>(
  run: (value: T) => void
): UnaryFunction<Observable<T>, Observable<never>> {
  return pipe(tap(run), ignoreElements());
}

export function select<STATE, RESULT>(
  selector: Selector<STATE, RESULT>
): OperatorFunction<STATE, RESULT> {
  return (source) =>
    new Observable((observer) =>
      source.subscribe(new SelectionObserver(selector.selection(), observer))
    );
}
