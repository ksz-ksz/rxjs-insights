import React from 'react';

function getLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function setLocalStorage(key: string, value: string): void {
  try {
    return localStorage.setItem(key, value);
  } catch (e) {}
}

export function useSidePanelWidth(
  initialWidth: number,
  localStorageKey: string
): {
  initialWidth: number;
  onWidthChange(width: number): void;
} {
  const localStorageValue = getLocalStorage(localStorageKey);
  const initialWidthRef = React.useRef(
    localStorageValue ? JSON.parse(localStorageValue) : initialWidth
  );
  const onWidthChange = React.useCallback(
    (width: number) => {
      setLocalStorage(localStorageKey, JSON.stringify(width));
    },
    [localStorageKey]
  );

  return { initialWidth: initialWidthRef.current, onWidthChange };
}
