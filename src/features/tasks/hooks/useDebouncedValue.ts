import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timerId = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timerId);
  }, [value, delayMs]);

  return debounced;
}