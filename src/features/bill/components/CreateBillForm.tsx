'use client';

import { useState, useMemo } from 'react';
import { useAccount, useEstimateGas, useGasPrice } from 'wagmi';
import { EscrowToggle } from './LazyEscrowToggle';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';
import { baseSepolia } from 'wagmi/chains';
import { encodeFunctionData, formatEther, keccak256, toBytes, parseEther } from 'viem';
import { GasEstimateDisplay } from '@/components/GasEstimateDisplay';

interface CreateBillFormProps {
  onCreateBill: (title: string, creatorAddress: string, escrowEnabled: boolean) => void;
}

export function CreateBillForm({ onCreateBill }: CreateBillFormProps) {
  const [title, setTitle] = useState('');
  const [escrowEnabled, setEscrowEnabled] = useState(false);
  const { address, isConnected } = useAccount();

  // Get current gas price
  const { data: gasPrice } = useGasPrice({
    chainId: baseSepolia.id,
  });

  // Estimate gas for creating escrow bill (with single participant - the creator)
  // This is a rough estimate since we don't know final participants yet
  const mockEscrowBillId = useMemo(() => {
    return keccak256(toBytes('mock-bill-id'));
  }, []);

  const mockBeneficiary = useMemo(() => {
    return (address || '0x0000000000000000000000000000000000000000') as `0x${string}`;
  }, [address]);

  const mockParticipants = useMemo(() => {
    return address ? [address as `0x${string}`] : [];
  }, [address]);

  const mockAmounts = useMemo(() => {
    // Mock amount: 0.001 ETH (equivalent to $1 USD at demo rate)
    return [parseEther('0.001')];
  }, []);

  const { data: gasEstimate, isLoading: isEstimatingGas } = useEstimateGas({
    to: ESCROW_CONTRACT_ADDRESS,
    account: address,
    data: encodeFunctionData({
      abi: ESCROW_ABI,
      functionName: 'createBill',
      args: [mockEscrowBillId, mockBeneficiary, mockParticipants, mockAmounts],
    }),
    chainId: baseSepolia.id,
    query: {
      enabled: isConnected && escrowEnabled && !!address,
    },
  });

  // Calculate gas cost
  const gasCostEth = useMemo(() => {
    if (!gasEstimate || !gasPrice) return null;
    // Add 20% buffer to gas estimate for safety
    const gasWithBuffer = (gasEstimate * BigInt(120)) / BigInt(100);
    const totalCost = gasWithBuffer * gasPrice;
    return formatEther(totalCost);
  }, [gasEstimate, gasPrice]);

  // Get gas price in gwei
  const gasPriceGwei = useMemo(() => {
    if (!gasPrice) return null;
    return Number(gasPrice) / 1_000_000_000;
  }, [gasPrice]);

  // Check if gas price is high (above 50 gwei)
  const isHighGasPrice = useMemo(() => {
    if (!gasPrice) return false;
    const HIGH_GAS_THRESHOLD = BigInt(50_000_000_000); // 50 gwei
    return gasPrice > HIGH_GAS_THRESHOLD;
  }, [gasPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && address) {
      onCreateBill(title, address, escrowEnabled);
      setTitle('');
      setEscrowEnabled(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Bill Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Dinner at Restaurant"
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400"
          required
        />
      </div>
      
      <EscrowToggle enabled={escrowEnabled} onChange={setEscrowEnabled} />
      
      {/* Gas estimate display for escrow bill creation */}
      {escrowEnabled && isConnected && (
        <GasEstimateDisplay
          gasCostEth={gasCostEth}
          gasPriceGwei={gasPriceGwei}
          isHighGasPrice={isHighGasPrice}
          isLoading={isEstimatingGas}
        />
      )}
      
      <button
        type="submit"
        disabled={!address}
        className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-slate-700"
      >
        {address ? 'Create Bill' : 'Connect Wallet First'}
      </button>
    </form>
  );
}
