import { defineChain } from 'viem';

export const peaqTestnet = defineChain({
  id: 3339,
  name: 'peaq Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PEAQ',
    symbol: 'PEAQ',
  },
  rpcUrls: {
    default: { http: ['https://evm-rpc-testnet.peaq.network'] },
  },
  blockExplorers: {
    default: { name: 'peaqScan', url: 'https://testnet.peaqscan.io' },
  },
});

export const peaq = defineChain({
  id: 3338,
  name: 'peaq',
  nativeCurrency: {
    decimals: 18,
    name: 'PEAQ',
    symbol: 'PEAQ',
  },
  rpcUrls: {
    default: { http: ['https://evm-rpc.peaq.network'] },
  },
  blockExplorers: {
    default: { name: 'peaqScan', url: 'https://peaqscan.io' },
  },
});