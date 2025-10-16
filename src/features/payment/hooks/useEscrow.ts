'use client';

import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useBalance,
} from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';
import { Bill, ParticipantShare } from '@/lib/types/bill';
import { generateEscrowBillId, prepareEscrowData } from '@/lib/utils/escrow';
import {
  validateWalletConnection,
  parseContractError,
  type EscrowError,
} from '@/lib/utils/escrowErrors';
import { useState, useEffect } from 'react';
import { getEthPrice } from '@/lib/utils/priceOracle';

/**
 * Hook for interacting with the escrow smart contract (write operations)
 * Provides functions to create escrow bills and pay shares with comprehensive error handling
 */
export function useEscrow() {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const [parsedError, setParsedError] = useState<EscrowError | null>(null);
  const [transactionStartTime, setTransactionStartTime] = useState<number | null>(null);
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  // Track transaction time and show warning if slow
  useEffect(() => {
    if (isConfirming && hash && !transactionStartTime) {
      setTransactionStartTime(Date.now());
    }

    if (isConfirming && transactionStartTime) {
      const elapsed = Date.now() - transactionStartTime;
      // Show warning after 60 seconds
      if (elapsed > 60000 && !showSlowWarning) {
        setShowSlowWarning(true);
      }
    }

    // Reset when transaction completes
    if (isSuccess || writeError) {
      setTransactionStartTime(null);
      setShowSlowWarning(false);
    }
  }, [isConfirming, hash, transactionStartTime, isSuccess, writeError, showSlowWarning]);

  /**
   * Handle network switching with user-friendly prompts
   */
  const handleNetworkSwitch = async (): Promise<boolean> => {
    if (chain?.id === baseSepolia.id) {
      return true; // Already on correct network
    }

    try {
      await switchChain({ chainId: baseSepolia.id });
      return true;
    } catch {
      setParsedError({
        title: 'Network Switch Failed',
        message: 'Unable to switch to Base Sepolia network.',
        action: 'Please switch networks manually in your wallet.',
      });
      return false;
    }
  };

  /**
   * Ensure user is on Base Sepolia, attempting automatic switch if needed
   */
  const ensureCorrectNetwork = async (): Promise<void> => {
    if (!chain?.id) {
      throw new Error('Unable to detect your wallet network. Please reconnect your wallet.');
    }

    if (chain.id !== baseSepolia.id) {
      const switched = await handleNetworkSwitch();
      if (!switched) {
        throw new Error('Please switch to Base Sepolia network');
      }
    }
  };

  const handleEscrowError = (error: unknown): EscrowError => {
    if (
      error instanceof Error &&
      error.message === 'Unable to detect your wallet network. Please reconnect your wallet.'
    ) {
      const friendlyError: EscrowError = {
        title: 'Network Not Detected',
        message: error.message,
        action: 'Reconnect your wallet and try again.',
      };
      setParsedError(friendlyError);
      return friendlyError;
    }

    if (
      error instanceof Error &&
      error.message.startsWith('Bill has no payable participants')
    ) {
      const friendlyError: EscrowError = {
        title: 'No Payable Participants',
        message: 'Add items or assign amounts so at least one participant owes funds.',
        action: 'Update the bill and try activating escrow again.',
      };
      setParsedError(friendlyError);
      return friendlyError;
    }

    const parsed = parseContractError(error);
    setParsedError(parsed);
    return parsed;
  };

  /**
   * Create escrow bill in smart contract
   * @param bill - The bill to create in escrow
   * @param shares - Array of participant shares
   * @returns The escrow bill ID (bytes32 hash)
   * @throws Error if wallet not connected or wrong network
   */
  const createEscrowBill = async (
    bill: Bill,
    shares: ParticipantShare[],
  ): Promise<string> => {
    try {
      // Clear previous errors
      setParsedError(null);

      // Validate wallet connection
      validateWalletConnection(address);

      // Validate and switch network if needed
      await ensureCorrectNetwork();

      // Generate contract-compatible bill ID
      const escrowBillId = generateEscrowBillId(bill.id);
      
      // Get real-time ETH price
      const ethPrice = await getEthPrice();
      
      const { participants, amounts } = prepareEscrowData(bill, shares, ethPrice);

      // Call contract to create bill
      writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'createBill',
        args: [escrowBillId, participants, amounts],
        chainId: baseSepolia.id,
      });

      return escrowBillId;
    } catch (error) {
      handleEscrowError(error);
      throw error;
    }
  };

  /**
   * Pay share via escrow contract
   * @param escrowBillId - The bytes32 bill ID in the contract
   * @param amount - Amount to pay in wei
   * @throws Error if wallet not connected or wrong network
   */
  const payEscrowShare = async (
    escrowBillId: string,
    amount: bigint,
  ): Promise<void> => {
    try {
      // Clear previous errors
      setParsedError(null);

      // Validate wallet connection
      validateWalletConnection(address);

      // Validate and switch network if needed
      await ensureCorrectNetwork();

      // Check balance (basic check - actual gas will be estimated by wallet)
      if (balance && balance.value < amount) {
        throw new Error('Insufficient balance to pay this amount.');
      }

      // Call contract to pay share
      writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'payShare',
        args: [escrowBillId as `0x${string}`],
        value: amount,
        chainId: baseSepolia.id,
      });
    } catch (error) {
      handleEscrowError(error);
      throw error;
    }
  };

  // Parse write errors when they occur
  const error = writeError ? parseContractError(writeError) : parsedError;

  return {
    createEscrowBill,
    payEscrowShare,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    error,
    switchChain: handleNetworkSwitch,
    isWrongNetwork: chain?.id !== baseSepolia.id,
    showSlowWarning,
  };
}
