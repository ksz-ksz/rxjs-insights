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

// TODO: make it operate with url as string; keep Location for router -> this would require exposing url encoder?
// TODO: move baseHref to router

export interface History {
  currentEntry: HistoryEntry;
  currentEntryOrigin: HistoryEntryOrigin;
  parse(pathname: string): Location;
  format(location: Location): string;
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

function formatLocation(
  { pathname, search, hash }: Location,
  baseHref: string
): string {
  let location = pathname === '' ? baseHref : `${baseHref}${pathname}`;
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

function getPathname(browserPathname: string, baseHref: string) {
  if (browserPathname.startsWith(baseHref)) {
    return browserPathname.substring(baseHref.length);
  } else {
    return '';
  }
}

function getLocation(browserLocation: Location, baseHref: string): Location {
  const { pathname, search, hash } = browserLocation;
  return { pathname: getPathname(pathname, baseHref), search, hash };
}

function getCurrentHistoryEntry(
  browserLocation: Location,
  browserState: any,
  baseHref: string
): HistoryEntry {
  return {
    location: getLocation(browserLocation, baseHref),
    state: browserState,
  };
}

class BrowserHistory implements History {
  currentEntry: HistoryEntry;
  currentEntryOrigin: HistoryEntryOrigin;

  private readonly listeners: PopEntryListener[] = [];

  constructor(
    private readonly window: Window,
    private readonly baseHref: string
  ) {
    this.currentEntry = getCurrentHistoryEntry(
      this.window.location,
      this.window.history.state,
      this.baseHref
    );
    this.currentEntryOrigin = 'pop';

    this.window.addEventListener('popstate', () => {
      this.currentEntry = getCurrentHistoryEntry(
        this.window.location,
        this.window.history.state,
        this.baseHref
      );
      this.currentEntryOrigin = 'pop';

      for (let listener of this.listeners) {
        listener(this.currentEntry);
      }
    });
  }

  parse(pathname: string): Location {
    throw new Error('not impl');
  }

  format(location: Location): string {
    return formatLocation(location, this.baseHref);
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
        this.window.history.pushState(
          state,
          '',
          formatLocation(location, this.baseHref)
        );
        break;
      case 'replace':
        this.window.history.replaceState(
          state,
          '',
          formatLocation(location, this.baseHref)
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
  baseHref?: string;
}

export function createBrowserHistory(
  options: BrowserHistoryOptions = {}
): History {
  return new BrowserHistory(options.window ?? window, options.baseHref ?? '/');
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

  parse(pathname: string): Location {
    throw new Error('not impl');
  }

  format(location: Location): string {
    return formatLocation(location, '');
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
