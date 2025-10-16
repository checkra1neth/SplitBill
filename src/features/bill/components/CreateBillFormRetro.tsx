'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccount, useEstimateGas, useConnect, useDisconnect } from 'wagmi';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';
import { baseSepolia } from 'wagmi/chains';
import { encodeFunctionData, formatEther, keccak256, toBytes, parseEther, createPublicClient, http } from 'viem';
import { formatEthAmount, formatGwei } from '@/lib/utils/formatNumber';

interface CreateBillFormRetroProps {
  onCreateBill: (title: string, creatorAddress: string, escrowEnabled: boolean) => void;
}

export function CreateBillFormRetro({ onCreateBill }: CreateBillFormRetroProps) {
  const [title, setTitle] = useState('');
  const [escrowEnabled, setEscrowEnabled] = useState(false);
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);
  const [isLoadingGasPrice, setIsLoadingGasPrice] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

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
        <div className="retro-status-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
          {isConnected && address ? (
            <>
              <span style={{ color: 'green', fontSize: '10px' }}>
                ✓ {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button
                type="button"
                className="retro-button"
                style={{ minWidth: 'auto', padding: '2px 8px', fontSize: '10px' }}
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            </>
          ) : (
            <>
              <span style={{ color: 'red', fontSize: '10px' }}>
                ✗ Not Connected
              </span>
              <button
                type="button"
                className="retro-button"
                style={{ minWidth: 'auto', padding: '2px 8px', fontSize: '10px' }}
                onClick={() => setShowWalletModal(true)}
              >
                Connect
              </button>
            </>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!address}
        className="retro-button"
        style={{ width: '100%' }}
      >
        Create Bill
      </button>

      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
            onClick={() => setShowWalletModal(false)}
          />

          {/* Modal Window */}
          <div
            className="retro-window"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              zIndex: 1000,
            }}
          >
            <div className="retro-title-bar">
              <div className="retro-title-text">
                <span className="retro-title-icon">🔌</span>
                <span>Connect Wallet</span>
              </div>
              <div className="retro-controls">
                <button 
                  className="retro-control-btn"
                  onClick={() => setShowWalletModal(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="retro-content">
              <p style={{ marginBottom: '12px', fontSize: '11px' }}>
                Select a wallet to connect:
              </p>
              <div className="retro-list" style={{ marginBottom: '12px' }}>
                {connectors.map((connector) => (
                  <div
                    key={connector.uid}
                    className="retro-list-item"
                    onClick={() => {
                      connect({ connector });
                      setShowWalletModal(false);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {connector.name}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="retro-button"
                  onClick={() => setShowWalletModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </form>
  );
}
