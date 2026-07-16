import { DEBOUNCE_MS } from "@maximilian/shared/constants/hooks/use-retardo.constants";
import { useState, useEffect } from "react";

export function useRetardo<T>(value: T, delay = DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
