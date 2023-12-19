import { Actions, ActionType } from '@lib/state-fx/store';
import { map } from 'rxjs';

export function mapAction<TFrom, TTo, TDeps>(
  fromActionType: ActionType<TFrom>,
  toActionType: ActionType<TTo>,
  fn: (from: TFrom, deps: TDeps) => TTo,
  deps: TDeps
) {
  return (actions: Actions) => {
    return actions
      .ofType(fromActionType)
      .pipe(map(({ payload }) => toActionType(fn(payload, deps))));
  };
}
