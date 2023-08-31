import { HistoryEntry } from './history';

export interface HistoryActions {
  Pop: {
    entry: HistoryEntry;
  };
}
