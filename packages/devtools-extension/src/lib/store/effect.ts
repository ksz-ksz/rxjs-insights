import { Observable } from 'rxjs';
import { Command } from './command';

export interface Effect {
  (command$: Observable<Command<any>>): Observable<Command<any>>;
}
