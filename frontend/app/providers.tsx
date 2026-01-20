'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { peaq, peaqTestnet } from './lib/chains';
import { ReactNode, useState } from 'react';

const config = createConfig({
  chains: [peaqTestnet, peaq],
  connectors: [
    injected(), 
    walletConnect({ 
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '' 
    }),
  ],
  transports: {
    [peaqTestnet.id]: http(),
    [peaq.id]: http(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}