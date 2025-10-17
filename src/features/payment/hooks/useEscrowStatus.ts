'use client';

import { useReadContract, useWatchContractEvent } from 'wagmi';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';
import { EscrowStatus } from '@/lib/types/bill';
import { useState, useEffect } from 'react';

/**
 * Hook for reading escrow bill status from smart contract
 * Watches for payment and settlement events and automatically refetches
 * Optimized polling: stops when bill is settled, uses longer intervals when inactive
 * @param escrowBillId - The bytes32 bill ID in the contract
 * @returns Escrow status, loading state, and refetch function
 */
export function useEscrowStatus(escrowBillId?: string) {
  const [lastUpdate, setLastUpdate] = useState(Date.now());
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

  // Read bill info from contract with optimized polling
  const { data, isLoading, refetch } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'getBillInfo',
    args: escrowBillId ? [escrowBillId as `0x${string}`] : undefined,
    query: {
      enabled: !!escrowBillId,
      // Optimize polling based on bill state and page visibility
      refetchInterval: (query) => {
        if (!isPageVisible) return false; // Stop polling when page hidden
        const billData = query.state.data as [string, bigint, bigint, bigint, boolean] | undefined;
        if (!billData) return 10000; // Default 10s if no data
        const settled = billData[4];
        if (settled) return false; // Stop polling when settled
        return 10000; // Poll every 10s for active bills
      },
    },
  });

  // Watch for PaymentReceived events
  useWatchContractEvent({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    eventName: 'PaymentReceived',
    onLogs: (logs) => {
      // Check if any log is for our bill
      const relevantLog = logs.find(
        (log) => log.args.billId === escrowBillId,
      );
      if (relevantLog) {
        setLastUpdate(Date.now());
        refetch();
      }
    },
  });

  // Watch for BillSettled events
  useWatchContractEvent({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    eventName: 'BillSettled',
    onLogs: (logs) => {
      // Check if any log is for our bill
      const relevantLog = logs.find(
        (log) => log.args.billId === escrowBillId,
      );
      if (relevantLog) {
        setLastUpdate(Date.now());
        refetch();
      }
    },
  });

  // Watch for BillCancelled events
  useWatchContractEvent({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    eventName: 'BillCancelled',
    onLogs: (logs) => {
      const relevantLog = logs.find(
        (log) => log.args.billId === escrowBillId,
      );
      if (relevantLog) {
        setLastUpdate(Date.now());
        refetch();
      }
    },
  });

  // Watch for PartialSettlement events
  useWatchContractEvent({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    eventName: 'PartialSettlement',
    onLogs: (logs) => {
      const relevantLog = logs.find(
        (log) => log.args.billId === escrowBillId,
      );
      if (relevantLog) {
        setLastUpdate(Date.now());
        refetch();
      }
    },
  });

  // Format contract data into EscrowStatus interface
  const escrowStatus: EscrowStatus | null = data
    ? {
        creator: data[0],
        beneficiary: data[1],
        totalAmount: data[2],
        participantCount: Number(data[3]),
        paidCount: Number(data[4]),
        settled: data[5],
        cancelled: data[6],
        deadline: Number(data[7]),
      }
    : null;

  return {
    escrowStatus,
    isLoading,
    lastUpdate,
    refetch,
  };
}
