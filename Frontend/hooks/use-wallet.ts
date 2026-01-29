'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { truncateAddress } from '@/lib/utils';

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const displayAddress = address ? truncateAddress(address) : '';

  const connectWallet = () => {
    const injectedConnector = connectors.find((c) => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  return {
    address,
    displayAddress,
    isConnected,
    isConnecting,
    connect: connectWallet,
    disconnect,
    connectors,
  };
}
