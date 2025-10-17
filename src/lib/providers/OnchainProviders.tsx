'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ReactNode, useState, useEffect } from 'react';
import { wagmiConfig } from '@/lib/config/appkit';
import { DEFAULT_CHAIN } from '@/lib/config/chains';
import { ToastProvider } from '@/lib/providers/ToastProvider';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { ThemeProvider } from '@/lib/providers/ThemeProvider';
import { injectAppKitRetroStyles } from '@/lib/utils/injectAppKitStyles';

export function OnchainProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  // Inject retro styles into AppKit Shadow DOM
  useEffect(() => {
    injectAppKitRetroStyles();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={DEFAULT_CHAIN}
          config={{
            appearance: {
              mode: 'auto',
            },
          }}
        >
          <ThemeProvider>
            <ToastProvider>
              <AppErrorBoundary>{children}</AppErrorBoundary>
            </ToastProvider>
          </ThemeProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
