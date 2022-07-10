import { useEffect, useRef } from 'react';

export function useLastDefinedValue<T>(
  value: T | undefined,
  defaultValue: T
): T {
  const ref = useRef<T | undefined>(value);

  useEffect(() => {
    if (value ?? false) {
      ref.current = value;
    }
  }, [value]);

  return value ?? ref.current ?? defaultValue!;
}
