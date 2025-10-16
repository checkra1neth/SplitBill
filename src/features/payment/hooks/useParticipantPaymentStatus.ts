'use client';

import { useReadContract } from 'wagmi';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';
import { useEffect, useState } from 'react';

/**
 * Hook for checking if a specific participant has paid their share
 * Optimized polling: stops when participant has paid, respects page visibility
 * @param escrowBillId - The bytes32 bill ID in the contract
 * @param participantAddress - The participant's wallet address
 * @returns Payment status and loading state
 */
export function useParticipantPaymentStatus(
  escrowBillId?: string,
  participantAddress?: string,
) {
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Track page visibility to optimize polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const { data: hasPaid, isLoading } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'hasPaid',
    args:
      escrowBillId && participantAddress
        ? [escrowBillId as `0x${string}`, participantAddress as `0x${string}`]
        : undefined,
    query: {
      enabled: !!escrowBillId && !!participantAddress,
      // Optimize polling: stop when paid or page hidden
      refetchInterval: (query) => {
        if (!isPageVisible) return false; // Stop polling when page hidden
        const paid = query.state.data as boolean | undefined;
        if (paid) return false; // Stop polling once participant has paid
        return 10000; // Poll every 10s while unpaid
      },
    },
  });

  return {
    hasPaid: hasPaid ?? false,
    isLoading,
  };
}
