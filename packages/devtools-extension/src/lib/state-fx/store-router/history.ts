export interface Location {
  pathname: string;
  search: string;
  hash: string;
}

export interface HistoryEntry {
  location: Location;
  state: any;
  index: number;
  key: string;
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

interface HistoryState {
  index: number;
  key: string;
  state: any;
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

function isHistoryState(state: any): state is HistoryState {
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof state.index === 'number' &&
    typeof state.key === 'string' &&
    'state' in state
  );
}

function getLocation(browserLocation: Location): Location {
  const { pathname, search, hash } = browserLocation;
  return { pathname, search, hash };
}

function getCurrentHistoryEntry(
  browserLocation: Location,
  browserState: any
): HistoryEntry {
  const location = getLocation(browserLocation);
  let key: string;
  let index: number;
  let state: any;

  if (isHistoryState(browserState)) {
    index = browserState.index;
    key = browserState.key;
    state = browserState.state;
  } else {
    index = 0;
    key = 'default';
    state = null;
  }

  return {
    key,
    index,
    state,
    location,
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

    this.window.history.replaceState(
      {
        key: this.currentEntry.key,
        index: this.currentEntry.index,
        state: this.currentEntry.state,
      },
      ''
    );

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
    const browserState: HistoryState = {
      key: crypto.randomUUID(),
      index: this.currentEntry.index + (mode === 'push' ? 1 : 0),
      state,
    };
    this.currentEntry = {
      ...browserState,
      location,
    };
    this.currentEntryOrigin = mode;

    switch (mode) {
      case 'push':
        this.window.history.pushState(
          browserState,
          '',
          formatLocation(location)
        );
        break;
      case 'replace':
        this.window.history.replaceState(
          browserState,
          '',
          formatLocation(location)
        );
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

class MemoryHistory implements History {
  currentEntry: HistoryEntry;
  currentEntryOrigin: HistoryEntryOrigin;

  private readonly listeners: PopEntryListener[] = [];
  private readonly entries: HistoryEntry[] = [];

  constructor() {
    this.currentEntry = {
      key: 'default',
      index: 0,
      state: null,
      location: {
        pathname: '',
        search: '',
        hash: '',
      },
    };
    this.currentEntryOrigin = 'pop';

    this.entries.push(this.currentEntry);
  }

  go(delta: number) {
    const index = this.currentEntry.index + delta;
    const entry = this.entries[index];

    if (entry === undefined) {
      console.warn(`no entry at index ${index}`);
      return;
    }

    this.currentEntry = entry;
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
      key: crypto.randomUUID(),
      index: this.currentEntry.index + (mode === 'push' ? 1 : 0),
      state,
      location,
    };
    this.currentEntryOrigin = mode;

    switch (mode) {
      case 'push':
        this.entries.length = this.currentEntry.index;
        this.entries.push(this.currentEntry);
        break;
      case 'replace':
        this.entries[this.currentEntry.index] = this.currentEntry;
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
