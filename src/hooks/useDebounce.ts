import { useState, useEffect } from "react";

const DEBOUNCE_MS = Number(import.meta.env.VITE_DEBOUNCE_MS ?? 300);

export function useDebounce<T>(value: T, delay = DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
