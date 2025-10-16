import { useMemo } from 'react';
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
    },
  });

  const metadata = useMemo(() => {
    if (!data) return null;
    const [encoded] = data as [string, string, bigint];
    if (!encoded) return null;
    return decodeBillFromShare(encoded);
  }, [data]);

  const owner = useMemo(() => {
    if (!data) return undefined;
    const [, entryOwner] = data as [string, string, bigint];
    return entryOwner;
  }, [data]);

  const updatedAt = useMemo(() => {
    if (!data) return undefined;
    const [, , timestamp] = data as [string, string, bigint];
    return timestamp;
  }, [data]);

  return {
    metadata,
    owner,
    updatedAt,
    isLoading,
    refetch,
  };
}

export function usePublishBillMetadata() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const publish = async (bill: Bill) => {
    if (!BILL_METADATA_CONTRACT_ADDRESS) {
      throw new Error('Metadata contract is not configured');
    }

    const metadata = encodeBillForShare(bill);
    await writeContract({
      address: BILL_METADATA_CONTRACT_ADDRESS,
      abi: BILL_METADATA_ABI,
      functionName: 'publishBill',
      args: [generateEscrowBillId(bill.id), metadata],
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
