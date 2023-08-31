export interface Location {
  pathname: string;
  search: string;
  hash: string;
}

export interface HistoryEntry {
  location: Location;
  state: any;
}

export type HistoryEntryOrigin = 'pop' | 'push' | 'replace';

export interface PopEntryListener {
  (entry: HistoryEntry): void;
}

export interface NewEntryOptions {
  mode?: 'push' | 'replace';
}

export interface History {
  currentEntry: HistoryEntry;
  currentEntryOrigin: HistoryEntryOrigin;
  go(delta: number): void;
  forward(): void;
  back(): void;
  newEntry(
    location: Location,
    state: any,
    options?: NewEntryOptions
  ): HistoryEntry;
  addPopEntryListener(listener: PopEntryListener): void;
  removePopEntryListener(listener: PopEntryListener): void;
}

function formatLocation({ pathname, search, hash }: Location): string {
  let location = pathname;
  if (search.length !== 0 && search !== '?') {
    if (!search.startsWith('?')) {
      location += '?';
    }
    location += search;
  }
  if (hash.length !== 0 && hash !== '#') {
    if (!hash.startsWith('#')) {
      location += '#';
    }
    location += hash;
  }
  return location;
}

function getLocation(browserLocation: Location): Location {
  const { pathname, search, hash } = browserLocation;
  return { pathname, search, hash };
}

function getCurrentHistoryEntry(
  browserLocation: Location,
  browserState: any
): HistoryEntry {
  return {
    location: getLocation(browserLocation),
    state: browserState,
  };
}

class BrowserHistory implements History {
  currentEntry: HistoryEntry;
  currentEntryOrigin: HistoryEntryOrigin;

  private readonly listeners: PopEntryListener[] = [];

  constructor(private readonly window: Window) {
    this.currentEntry = getCurrentHistoryEntry(
      this.window.location,
      this.window.history
    );
    this.currentEntryOrigin = 'pop';

    this.window.addEventListener('popstate', () => {
      this.currentEntry = getCurrentHistoryEntry(
        this.window.location,
        this.window.history
      );
      this.currentEntryOrigin = 'pop';

      for (let listener of this.listeners) {
        listener(this.currentEntry);
      }
    });
  }

  go(delta: number) {
    this.window.history.go(delta);
  }

  forward() {
    this.window.history.forward();
  }

  back() {
    this.window.history.back();
  }

  newEntry(
    location: Location,
    state: any,
    { mode = 'push' }: NewEntryOptions = {}
  ): HistoryEntry {
    this.currentEntry = {
      location,
      state,
    };
    this.currentEntryOrigin = mode;

    switch (mode) {
      case 'push':
        this.window.history.pushState(state, '', formatLocation(location));
        break;
      case 'replace':
        this.window.history.replaceState(state, '', formatLocation(location));
        break;
    }

    return this.currentEntry;
  }

  addPopEntryListener(listener: PopEntryListener): void {
    this.listeners.push(listener);
  }

  removePopEntryListener(listener: PopEntryListener): void {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }
}

export interface BrowserHistoryOptions {
  window?: Window;
}

export function createBrowserHistory(
  options: BrowserHistoryOptions = {}
): History {
  return new BrowserHistory(options.window ?? window);
}

interface MemoryHistoryEntry {
  index: number;
  entry: HistoryEntry;
}

class MemoryHistory implements History {
  currentIndex: number;
  currentEntry: HistoryEntry;
  currentEntryOrigin: HistoryEntryOrigin;

  private readonly listeners: PopEntryListener[] = [];
  private readonly entries: MemoryHistoryEntry[] = [];

  constructor() {
    this.currentIndex = 0;
    this.currentEntry = {
      state: null,
      location: {
        pathname: '',
        search: '',
        hash: '',
      },
    };
    this.currentEntryOrigin = 'pop';

    this.entries.push({
      index: this.currentIndex,
      entry: this.currentEntry,
    });
  }

  go(delta: number) {
    const index = this.currentIndex + delta;
    const entry = this.entries[index];

    if (entry === undefined) {
      console.warn(`no entry at index ${index}`);
      return;
    }

    this.currentIndex = entry.index;
    this.currentEntry = entry.entry;
    this.currentEntryOrigin = 'pop';

    for (let listener of this.listeners) {
      listener(this.currentEntry);
    }
  }

  forward() {
    this.go(1);
  }

  back() {
    this.go(-1);
  }

  newEntry(
    location: Location,
    state: any,
    { mode = 'push' }: NewEntryOptions = {}
  ): HistoryEntry {
    this.currentEntry = {
      state,
      location,
    };
    this.currentEntryOrigin = mode;

    switch (mode) {
      case 'push':
        this.entries.length = this.currentIndex;
        this.currentIndex += 1;
        this.entries.push({
          index: this.currentIndex,
          entry: this.currentEntry,
        });
        break;
      case 'replace':
        this.entries[this.currentIndex] = {
          index: this.currentIndex,
          entry: this.currentEntry,
        };
        break;
    }

    return this.currentEntry;
  }

  addPopEntryListener(listener: PopEntryListener): void {
    this.listeners.push(listener);
  }

  removePopEntryListener(listener: PopEntryListener): void {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }
}

export function createMemoryHistory() {
  return new MemoryHistory();
}
