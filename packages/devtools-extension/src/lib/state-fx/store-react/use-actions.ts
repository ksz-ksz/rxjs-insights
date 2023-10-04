import { useComponent } from './use-component';
import { Actions, actionsComponent } from '@lib/state-fx/store';

export function useActions(): Actions {
  return useComponent(actionsComponent);
}
