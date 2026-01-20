'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { peaq, peaqTestnet } from '@/lib/chains';
import { ReactNode, useState } from 'react';

const config = createConfig(
  getDefaultConfig({
    appName: 'CarbonSeal',
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    chains: [peaqTestnet, peaq],
    transports: {
      [peaqTestnet.id]: http(),
      [peaq.id]: http(),
    },
  })
);

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="soft"
          mode="light"
          customTheme={{
            '--ck-font-family': 'Inter, sans-serif',
            '--ck-border-radius': '12px',
            '--ck-overlay-background': 'rgba(0,0,0,0.4)',
            '--ck-overlay-backdrop-filter': 'blur(12px)',
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}