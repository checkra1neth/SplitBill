'use client';

import { useReadContract } from 'wagmi';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';
import { baseSepolia } from 'wagmi/chains';

/**
 * Hook to read participant's share amount from escrow contract
 * Returns the exact amount in wei that participant needs to pay
 */
export function useEscrowShare(escrowBillId: string, participantAddress?: `0x${string}`) {
  const { data: shareAmount, isLoading, error } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'getShare',
    args: [escrowBillId as `0x${string}`, participantAddress!],
    chainId: baseSepolia.id,
    query: {
      enabled: !!escrowBillId && !!participantAddress,
    },
  });

  return {
    shareAmount: shareAmount as bigint | undefined,
    isLoading,
    error,
  };
}

/**
 * Hook to check if a participant has paid their share
 */
export function useEscrowPaymentStatus(escrowBillId: string, participantAddress?: `0x${string}`) {
  const { data: hasPaid, isLoading, error, refetch } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'hasPaid',
    args: [escrowBillId as `0x${string}`, participantAddress!],
    chainId: baseSepolia.id,
    query: {
      enabled: !!escrowBillId && !!participantAddress,
      refetchInterval: 5000, // Refetch every 5 seconds to update status
    },
  });

  return {
    hasPaid: hasPaid as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
}
