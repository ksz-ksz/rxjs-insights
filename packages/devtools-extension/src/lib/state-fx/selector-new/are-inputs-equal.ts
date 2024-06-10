import { SelectorInput } from './selector-execution-result';
import { SelectorContext } from './selector';

export function areInputsEqual<TState>(
  inputs: SelectorInput<TState>[],
  context: SelectorContext<TState>
) {
  for (const input of inputs) {
    const inputResult = input.selector(context, ...input.args);
    if (input.result !== inputResult) {
      return false;
    }
  }
  return true;
}