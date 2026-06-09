import { QueryClient } from "@tanstack/react-query";

// Cliente partilhado do React Query. Importado no main.tsx pelo QueryClientProvider.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s antes de considerar os dados "velhos"
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
