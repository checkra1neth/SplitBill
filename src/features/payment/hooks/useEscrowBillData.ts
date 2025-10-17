'use client';

import { useReadContract } from 'wagmi';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';
import { baseSepolia } from 'wagmi/chains';

/**
 * Hook to read participant's share amount from escrow contract
 * Returns the exact amount in wei that participant needs to pay
 */
export function useEscrowShare(escrowBillId: string, participantAddress?: `0x${string}`) {
  const { data: shareAmount, isLoading, error, refetch } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'getShare',
    args: [escrowBillId as `0x${string}`, participantAddress!],
    chainId: baseSepolia.id,
    query: {
      enabled: !!escrowBillId && !!participantAddress,
      refetchInterval: 3000, // Auto-refresh every 3 seconds to detect escrow activation
    },
  });

  return {
    shareAmount: shareAmount as bigint | undefined,
    isLoading,
    error,
    refetch,
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

/**
 * Hook to get bill status information (cancelled, settled, etc.)
 */
export function useEscrowBillInfo(escrowBillId: string) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'getBillInfo',
    args: [escrowBillId as `0x${string}`],
    chainId: baseSepolia.id,
    query: {
      enabled: !!escrowBillId,
      refetchInterval: 5000, // Refetch every 5 seconds to update status
    },
  });

  const billInfo = data as [string, string, bigint, bigint, bigint, boolean, boolean, bigint] | undefined;

  return {
    creator: billInfo?.[0] as string | undefined,
    beneficiary: billInfo?.[1] as string | undefined,
    totalAmount: billInfo?.[2] as bigint | undefined,
    participantCount: billInfo?.[3] ? Number(billInfo[3]) : undefined,
    paidCount: billInfo?.[4] ? Number(billInfo[4]) : undefined,
    settled: billInfo?.[5] as boolean | undefined,
    cancelled: billInfo?.[6] as boolean | undefined,
    deadline: billInfo?.[7] as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if participant can claim refund
 */
export function useCanRefund(escrowBillId: string, participantAddress?: `0x${string}`) {
  const { data: canRefund, isLoading, error, refetch } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'canRefund',
    args: [escrowBillId as `0x${string}`, participantAddress!],
    chainId: baseSepolia.id,
    query: {
      enabled: !!escrowBillId && !!participantAddress,
      refetchInterval: 5000,
    },
  });

  return {
    canRefund: canRefund as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
}
