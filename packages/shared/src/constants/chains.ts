export interface ChainConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
}

export function getPeaqChain(): ChainConfig {
  if (!process.env.PEAQ_RPC_URL || !process.env.PEAQ_CHAIN_ID) {
    throw new Error('Missing peaq chain env vars');
  }

  return {
    name: 'peaq',
    rpcUrl: process.env.PEAQ_RPC_URL,
    chainId: Number(process.env.PEAQ_CHAIN_ID)
  };
}
