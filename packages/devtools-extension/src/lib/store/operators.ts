import { filter, OperatorFunction } from 'rxjs';
import { Command, CommandType } from './command';

export function commandOfType<T>(commandType: CommandType<T>) {
  return filter(
    (command: Command<any>) => commandType.commandName === command.commandName
  ) as OperatorFunction<Command<any>, Command<T>>;
}
