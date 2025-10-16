'use client';

import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';
import { baseSepolia } from 'wagmi/chains';

export function usePayment() {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: hash, sendTransaction, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const sendPayment = async (to: string, amount: number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    // Check if we're on the correct network
    if (chain?.id !== baseSepolia.id) {
      try {
        await switchChain({ chainId: baseSepolia.id });
      } catch {
        throw new Error('Please switch to Base Sepolia network');
      }
    }

    sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amount.toString()),
      chainId: baseSepolia.id,
    });
  };

  return {
    sendPayment,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    isWrongNetwork: chain?.id !== baseSepolia.id,
    currentChain: chain,
  };
}
