"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type State, WagmiProvider } from "wagmi";
import { useState } from "react";
import { config } from "@/lib/wagmi/config";

export function AppProviders({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State | undefined;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000 },
        },
      }),
  );

  return (
    <WagmiProvider config={config} initialState={initialState} reconnectOnMount>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
