import { Action, ActionFactory } from './action';
import { filter, OperatorFunction } from 'rxjs';

export function filterActions<PAYLOAD>(
  actionFactory: ActionFactory<PAYLOAD>,
  predicate: (action: Action<PAYLOAD>) => boolean = () => true
) {
  return filter(
    (action) => action.type == actionFactory.type && predicate(action)
  ) as OperatorFunction<Action<any>, Action<PAYLOAD>>;
}
