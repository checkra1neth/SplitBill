import { useMemo, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { BILL_METADATA_ABI, BILL_METADATA_CONTRACT_ADDRESS, isMetadataRegistryConfigured } from '@/lib/config/metadata';
import { Bill } from '@/lib/types/bill';
import { encodeBillForShare, decodeBillFromShare } from '@/lib/utils/share';
import { generateEscrowBillId } from '@/lib/utils/escrow';

export function useBillMetadata(billId?: string) {
  const enabled = Boolean(billId && isMetadataRegistryConfigured());
  const billHash = useMemo(() => (billId ? generateEscrowBillId(billId) : undefined), [billId]);

  const { data, isLoading, refetch } = useReadContract({
    address: BILL_METADATA_CONTRACT_ADDRESS,
    abi: BILL_METADATA_ABI,
    functionName: 'getBill',
    args: billHash ? [billHash] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled,
      // Don't auto-refetch - only refetch when explicitly called
      refetchInterval: false,
      staleTime: 30000, // Consider data fresh for 30 seconds
    },
  });

  const metadata = useMemo(() => {
    if (!data) return null;
    const [ipfsHash] = data as [string, string, bigint, bigint, string[], boolean, number, number];
    if (!ipfsHash) return null;
    // For now, ipfsHash contains full metadata (backward compatible)
    return decodeBillFromShare(ipfsHash);
  }, [data]);

  const owner = useMemo(() => {
    if (!data) return undefined;
    const [, entryOwner] = data as [string, string, bigint, bigint, string[], boolean, number, number];
    return entryOwner;
  }, [data]);

  const updatedAt = useMemo(() => {
    if (!data) return undefined;
    const [, , , timestamp] = data as [string, string, bigint, bigint, string[], boolean, number, number];
    return timestamp;
  }, [data]);

  const tags = useMemo(() => {
    if (!data) return undefined;
    const [, , , , billTags] = data as [string, string, bigint, bigint, string[], boolean, number, number];
    return billTags;
  }, [data]);

  const isPrivate = useMemo(() => {
    if (!data) return undefined;
    const [, , , , , privacy] = data as [string, string, bigint, bigint, string[], boolean, number, number];
    return privacy;
  }, [data]);

  const rating = useMemo(() => {
    if (!data) return undefined;
    const [, , , , , , avgRating, count] = data as [string, string, bigint, bigint, string[], boolean, number, number];
    return { average: avgRating / 10, count }; // Convert from 0-50 to 0-5
  }, [data]);

  return {
    metadata,
    owner,
    updatedAt,
    tags,
    isPrivate,
    rating,
    isLoading,
    refetch,
  };
}

export function usePublishBillMetadata() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash: txHash,
    query: {
      enabled: !!txHash, // Only watch when we have a hash
    },
  });

  // Debug logging
  useEffect(() => {
    console.log('usePublishBillMetadata state changed:', {
      txHash,
      isPending,
      isConfirming,
      isSuccess,
      error: error?.message,
    });
  }, [txHash, isPending, isConfirming, isSuccess, error]);

  /**
   * Publish bill metadata to blockchain
   * @param bill - Bill object to publish
   * @param options - Optional settings (backward compatible)
   */
  const publish = async (
    bill: Bill,
    options?: {
      tags?: string[];
      isPrivate?: boolean;
    }
  ) => {
    if (!BILL_METADATA_CONTRACT_ADDRESS) {
      throw new Error('Metadata contract is not configured');
    }

    // For now, store full metadata as "IPFS hash" (will add real IPFS later)
    const metadata = encodeBillForShare(bill);
    
    // Calculate total amount in wei
    const totalAmount = BigInt(
      Math.floor((bill.items.reduce((sum, item) => sum + item.amount, 0) + bill.tip + bill.tax) * 1e18)
    );

    // Default values for backward compatibility
    const tags = options?.tags || [];
    const isPrivate = options?.isPrivate || false;

    await writeContract({
      address: BILL_METADATA_CONTRACT_ADDRESS,
      abi: BILL_METADATA_ABI,
      functionName: 'publishBill',
      args: [
        generateEscrowBillId(bill.id),
        metadata, // Will be IPFS hash in future
        tags,
        isPrivate,
        totalAmount,
      ],
      chainId: baseSepolia.id,
    });
  };

  return {
    publish,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}


/**
 * Hook for managing bill access (privacy)
 */
export function useBillAccess() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const grantAccess = async (billId: string, userAddress: string) => {
    if (!BILL_METADATA_CONTRACT_ADDRESS) {
      throw new Error('Metadata contract is not configured');
    }

    await writeContract({
      address: BILL_METADATA_CONTRACT_ADDRESS,
      abi: BILL_METADATA_ABI,
      functionName: 'grantAccess',
      args: [generateEscrowBillId(billId), userAddress as `0x${string}`],
      chainId: baseSepolia.id,
    });
  };

  const revokeAccess = async (billId: string, userAddress: string) => {
    if (!BILL_METADATA_CONTRACT_ADDRESS) {
      throw new Error('Metadata contract is not configured');
    }

    await writeContract({
      address: BILL_METADATA_CONTRACT_ADDRESS,
      abi: BILL_METADATA_ABI,
      functionName: 'revokeAccess',
      args: [generateEscrowBillId(billId), userAddress as `0x${string}`],
      chainId: baseSepolia.id,
    });
  };

  return {
    grantAccess,
    revokeAccess,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for rating bills
 */
export function useRateBill() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const rateBill = async (billId: string, rating: number) => {
    if (!BILL_METADATA_CONTRACT_ADDRESS) {
      throw new Error('Metadata contract is not configured');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    await writeContract({
      address: BILL_METADATA_CONTRACT_ADDRESS,
      abi: BILL_METADATA_ABI,
      functionName: 'rateBill',
      args: [generateEscrowBillId(billId), rating],
      chainId: baseSepolia.id,
    });
  };

  return {
    rateBill,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for searching bills by tag
 */
export function useBillsByTag(tag?: string) {
  const enabled = Boolean(tag && isMetadataRegistryConfigured());

  const { data, isLoading, refetch } = useReadContract({
    address: BILL_METADATA_CONTRACT_ADDRESS,
    abi: BILL_METADATA_ABI,
    functionName: 'getBillsByTag',
    args: tag ? [tag] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled,
    },
  });

  const billIds = useMemo(() => {
    if (!data) return [];
    return data as `0x${string}`[];
  }, [data]);

  return {
    billIds,
    isLoading,
    refetch,
  };
}

/**
 * Hook for getting user's bills
 */
export function useUserBills(userAddress?: string) {
  const enabled = Boolean(userAddress && isMetadataRegistryConfigured());

  const { data, isLoading, refetch } = useReadContract({
    address: BILL_METADATA_CONTRACT_ADDRESS,
    abi: BILL_METADATA_ABI,
    functionName: 'getUserBills',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled,
    },
  });

  const billIds = useMemo(() => {
    if (!data) return [];
    return data as `0x${string}`[];
  }, [data]);

  return {
    billIds,
    isLoading,
    refetch,
  };
}

/**
 * Hook for getting user statistics
 */
export function useUserStats(userAddress?: string) {
  const enabled = Boolean(userAddress && isMetadataRegistryConfigured());

  const { data, isLoading, refetch } = useReadContract({
    address: BILL_METADATA_CONTRACT_ADDRESS,
    abi: BILL_METADATA_ABI,
    functionName: 'getUserStats',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled,
    },
  });

  const stats = useMemo(() => {
    if (!data) return null;
    const [billsCount, amountTotal, lastActivityTime] = data as [bigint, bigint, bigint];
    return {
      totalBills: Number(billsCount),
      totalAmount: amountTotal,
      lastActivity: Number(lastActivityTime),
    };
  }, [data]);

  return {
    stats,
    isLoading,
    refetch,
  };
}

/**
 * Hook for getting global statistics
 */
export function useGlobalStats() {
  const enabled = isMetadataRegistryConfigured();

  const { data, isLoading, refetch } = useReadContract({
    address: BILL_METADATA_CONTRACT_ADDRESS,
    abi: BILL_METADATA_ABI,
    functionName: 'getGlobalStats',
    chainId: baseSepolia.id,
    query: {
      enabled,
    },
  });

  const stats = useMemo(() => {
    if (!data) return null;
    const [billsCount, volumeTotal] = data as [bigint, bigint];
    return {
      totalBills: Number(billsCount),
      totalVolume: volumeTotal,
    };
  }, [data]);

  return {
    stats,
    isLoading,
    refetch,
  };
}
