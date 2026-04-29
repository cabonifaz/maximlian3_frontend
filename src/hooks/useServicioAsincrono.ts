import { useState, useCallback, useEffect, useRef } from "react";
import type { ErrorResponse } from "@maximilian/shared/types/error.type";

export interface AsyncState<T> {
  result: T | null;
  error: ErrorResponse | null;
  loading: boolean;
}

export interface UseAsyncOptions<Args extends unknown[]> {
  /**
   * Whether to execute the async function immediately on mount
   */
  immediate?: boolean;
  /**
   * Arguments to pass to the async function if immediate is true
   */
  immediateArgs?: Args;
}

/**
 * Configuration for the API call, including the AbortSignal for cancellation
 */
export interface ApiConfig {
  signal?: AbortSignal;
}

/**
 * Hook to handle asynchronous operations with built-in cancellation support
 * * @param asyncFunction - The service function to execute
 * @param options - Configuration options for the hook
 * @returns State object and the execute function
 */
export const useServicioAsincrono = <T, Args extends unknown[]>(
  asyncFunction: (
    ...args: [...Args, ApiConfig]
  ) => Promise<{ data: T }>,
  options?: UseAsyncOptions<Args>,
) => {
  const [state, setState] = useState<AsyncState<T>>({
    result: null,
    error: null,
    loading: options?.immediate ?? false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<AsyncState<T>> => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new controller for the current request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Execute the function passing the signal as the last argument
        const response = await asyncFunction(...args, {
          signal: controller.signal,
        });

        const successState: AsyncState<T> = {
          result: response.data,
          error: null,
          loading: false,
        };

        // Update state only if the request wasn't aborted
        if (!controller.signal.aborted) {
          setState(successState);
        }
        return successState;
      } catch (err: unknown) {
        // Ignore the error if it was manually canceled
        const error = err as Error;
        if (
          error.name === "CanceledError" ||
          controller.signal.aborted
        ) {
          return { result: null, error: null, loading: false };
        }

        const errorState: AsyncState<T> = {
          result: null,
          error: err as ErrorResponse,
          loading: false,
        };

        setState(errorState);
        return errorState;
      }
    },
    [asyncFunction],
  );

  const hasExecuted = useRef(false);

  useEffect(() => {
    if (!options?.immediate || hasExecuted.current) return;

    hasExecuted.current = true;
    const args = (options.immediateArgs ?? []) as Args;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    execute(...args);

    // Cleanup: abort the request if the component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute, options?.immediate, options?.immediateArgs]);

  return { ...state, execute };
};
