"use client";

import {
  useState,
  type ReactNode,
} from "react";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  ThemeProvider,
} from "next-themes";

import {
  Toaster,
} from "@/components/ui/sonner";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({
  children,
}: AppProvidersProps) {
  const [
    queryClient,
  ] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:
              30_000,

            retry: 1,

            refetchOnWindowFocus:
              false,
          },

          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider
        client={
          queryClient
        }
      >
        {children}

        <Toaster
          richColors
          closeButton
          position="top-right"
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}