import { QueryClient } from "@tanstack/react-query";

export const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});
