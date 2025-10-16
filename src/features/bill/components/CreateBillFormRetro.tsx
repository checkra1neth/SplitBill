'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccount, useEstimateGas } from 'wagmi';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';
import { baseSepolia } from 'wagmi/chains';
import { encodeFunctionData, formatEther, keccak256, toBytes, parseEther, createPublicClient, http } from 'viem';
import { formatEthAmount, formatGwei } from '@/lib/utils/formatNumber';
import { AppKitButton } from '@/components/AppKitButton';

interface CreateBillFormRetroProps {
  onCreateBill: (title: string, creatorAddress: string, escrowEnabled: boolean) => void;
}

export function CreateBillFormRetro({ onCreateBill }: CreateBillFormRetroProps) {
  const [title, setTitle] = useState('');
  const [escrowEnabled, setEscrowEnabled] = useState(false);
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);
  const [isLoadingGasPrice, setIsLoadingGasPrice] = useState(false);
  const { address, isConnected } = useAccount();

  // Fetch gas price directly from RPC
  useEffect(() => {
    const fetchGasPrice = async () => {
      try {
        setIsLoadingGasPrice(true);
        const client = createPublicClient({
          chain: baseSepolia,
          transport: http('https://sepolia.base.org'),
        });
        const price = await client.getGasPrice();
        setGasPrice(price);
        console.log('Fetched gas price:', Number(price) / 1_000_000_000, 'gwei');
      } catch (error) {
        console.error('Failed to fetch gas price:', error);
      } finally {
        setIsLoadingGasPrice(false);
      }
    };

    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Estimate gas for creating escrow bill
  const mockEscrowBillId = useMemo(() => {
    return keccak256(toBytes('mock-bill-id'));
  }, []);

  const mockParticipants = useMemo(() => {
    return address ? [address as `0x${string}`] : [];
  }, [address]);

  const mockAmounts = useMemo(() => {
    return [parseEther('0.001')];
  }, []);

  const { data: gasEstimate, isLoading: isEstimatingGas } = useEstimateGas({
    to: ESCROW_CONTRACT_ADDRESS,
    account: address,
    data: encodeFunctionData({
      abi: ESCROW_ABI,
      functionName: 'createBill',
      args: [mockEscrowBillId, mockParticipants, mockAmounts],
    }),
    chainId: baseSepolia.id,
    query: {
      enabled: isConnected && escrowEnabled && !!address,
    },
  });

  // Calculate gas cost
  const gasCostEth = useMemo(() => {
    if (!gasEstimate || !gasPrice) return null;
    const gasWithBuffer = (gasEstimate * BigInt(120)) / BigInt(100);
    const totalCost = gasWithBuffer * gasPrice;
    const ethValue = parseFloat(formatEther(totalCost));
    return formatEthAmount(ethValue);
  }, [gasEstimate, gasPrice]);

  // Get gas price in gwei
  const gasPriceGwei = useMemo(() => {
    if (!gasPrice) return null;
    const gwei = Number(gasPrice) / 1_000_000_000;
    return formatGwei(gwei);
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
    <form onSubmit={handleSubmit}>

      <div style={{ marginBottom: '12px' }}>
        <label className="retro-label">Bill Title:</label>
        <input
          type="text"
          className="retro-input"
          style={{ width: '100%' }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Dinner at Restaurant"
          required
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              className="retro-checkbox"
              checked={escrowEnabled}
              onChange={(e) => setEscrowEnabled(e.target.checked)}
            />
            <span className="retro-label" style={{ margin: 0 }}>
              Use Escrow Protection
            </span>
          </label>
          <button
            type="button"
            onClick={() => alert('Escrow Protection:\n\n• Funds locked until everyone pays\n• Automatic settlement when complete\n• On-chain proof of payment\n• Trustless - no need to trust the bill creator\n\nGas Costs:\n• Bill creator pays ~$0.01-0.05 to create\n• Each participant pays ~$0.01-0.03 to pay their share')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0000ff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '11px',
              padding: 0
            }}
          >
            What&apos;s this?
          </button>
        </div>
      </div>

      {/* Gas estimate display */}
      {escrowEnabled && isConnected && (
        <div style={{ 
          marginBottom: '12px',
          background: '#ffffff',
          border: '1px solid #808080',
          padding: '8px',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Estimated Gas Cost:</span>
            <strong>
              {isEstimatingGas ? 'Calculating...' : gasCostEth ? `~${gasCostEth} ETH` : 'N/A'}
            </strong>
          </div>
          <div style={{ fontSize: '10px', color: '#666' }}>
            Current gas price: {
              isLoadingGasPrice ? 'Loading...' :
              gasPriceGwei ? `${gasPriceGwei} gwei` : 
              'Fetching...'
            }
          </div>
        </div>
      )}

      {/* Wallet Status and Action */}
      <div style={{ marginBottom: '12px' }}>
        <label className="retro-label">Wallet:</label>
        <AppKitButton />
      </div>

      <button
        type="submit"
        disabled={!address}
        className="retro-button"
        style={{ width: '100%' }}
      >
        Create Bill
      </button>
    </form>
  );
}
