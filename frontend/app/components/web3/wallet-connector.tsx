'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, Loader2, X } from 'lucide-react';
import { AnimatedButton } from '../../components/ui/animated-button';

export function WalletConnector() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  const handleConnect = (connector: any) => {
    connect({ connector });
    setIsModalOpen(false);
  };

  return (
    <>
      <AnimatedButton
        onClick={() => (isConnected ? disconnect() : setIsModalOpen(true))}
        variant={isConnected ? 'secondary' : 'primary'}
        size="lg"
        className="min-w-50"
      >
        {isConnecting ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Connecting...</span>
          </div>
        ) : isConnected ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-r from-purple-400 to-purple-500 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span>{truncatedAddress}</span>
            <LogOut className="w-4 h-4" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5" />
            <span>Connect Wallet</span>
          </div>
        )}
      </AnimatedButton>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">Select a Wallet</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-zinc-100 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 flex flex-col gap-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => handleConnect(connector)}
                    className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all group"
                  >
                    <span className="font-medium group-hover:text-purple-600 transition-colors">
                      {connector.name}
                    </span>
                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-400">
                      UI
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}