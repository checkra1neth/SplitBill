'use client';

import { useEscrow } from '../hooks/useEscrow';
import { useToast } from '@/lib/providers/ToastProvider';
import { getExplorerUrl } from '@/lib/utils/escrow';
import { useEffect, useState, useMemo } from 'react';
import { useAccount, useEstimateGas, useGasPrice } from 'wagmi';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';
import { baseSepolia } from 'wagmi/chains';
import { encodeFunctionData, formatEther } from 'viem';
import { GasEstimateDisplay } from '@/components/GasEstimateDisplay';
import { trackEvent } from '@/lib/utils/analytics';
import { useEthPrice } from '@/lib/hooks/useEthPrice';
import { useEscrowShare } from '../hooks/useEscrowBillData';
import { formatEthAmount } from '@/lib/utils/formatNumber';

interface EscrowPaymentButtonProps {
  escrowBillId: string;
  amount: number; // in USD
  disabled?: boolean;
}

export function EscrowPaymentButton({
  escrowBillId,
  amount,
  disabled,
}: EscrowPaymentButtonProps) {
  const { isConnected, address } = useAccount();
  const {
    payEscrowShare,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    error,
    switchChain,
    isWrongNetwork,
    showSlowWarning,
  } = useEscrow();
  const { showToast } = useToast();
  const [showError, setShowError] = useState(false);
  
  // Get real-time ETH price for display only
  const { price: ethPrice } = useEthPrice();

  // IMPORTANT: Read exact amount from contract (in wei)
  // This is the amount that was stored when bill was created
  const { shareAmount: weiAmount, isLoading: isLoadingShare } = useEscrowShare(
    escrowBillId,
    address
  );

  // Convert wei to ETH for display
  const ethAmount = useMemo(() => {
    if (!weiAmount) return 0;
    return Number(formatEther(weiAmount));
  }, [weiAmount]);

  // Get current gas price
  const { data: gasPrice } = useGasPrice({
    chainId: baseSepolia.id,
  });

  // Estimate gas for payment transaction
  const { data: gasEstimate, isLoading: isEstimatingGas } = useEstimateGas({
    to: ESCROW_CONTRACT_ADDRESS,
    account: address,
    data: encodeFunctionData({
      abi: ESCROW_ABI,
      functionName: 'payShare',
      args: [escrowBillId as `0x${string}`],
    }),
    value: weiAmount,
    chainId: baseSepolia.id,
    query: {
      enabled: isConnected && !isWrongNetwork && !!address,
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

  // Show toast notifications based on transaction state
  useEffect(() => {
    if (isSuccess && hash) {
      showToast({
        message: 'Payment successful!',
        type: 'success',
      });
      setShowError(false);
      // Track successful payment
      trackEvent('escrow_payment_success', {
        billId: escrowBillId,
        amount,
        gasCostEth: gasCostEth || undefined,
      });
    }
  }, [isSuccess, hash, showToast, escrowBillId, amount, gasCostEth]);

  useEffect(() => {
    if (error) {
      setShowError(true);
      // Track payment failure
      trackEvent('escrow_payment_failed', {
        billId: escrowBillId,
        amount,
        errorMessage: error.message,
      });
    }
  }, [error, escrowBillId, amount]);

  const handlePay = async () => {
    try {
      setShowError(false);

      // Check wallet connection
      if (!isConnected) {
        showToast({
          message: 'Please connect your wallet to continue.',
          type: 'error',
        });
        return;
      }

      // Handle wrong network
      if (isWrongNetwork) {
        showToast({
          message: 'Switching to Base Sepolia network...',
          type: 'info',
        });
        trackEvent('network_switch_prompted', {
          networkName: 'Base Sepolia',
        });
        await switchChain();
        trackEvent('network_switch_completed', {
          networkName: 'Base Sepolia',
        });
        return;
      }

      // Track payment initiation
      trackEvent('escrow_payment_initiated', {
        billId: escrowBillId,
        amount,
        gasCostEth: gasCostEth || undefined,
      });

      if (!weiAmount) {
        throw new Error('Payment amount not loaded');
      }

      await payEscrowShare(escrowBillId, weiAmount);

      showToast({
        message: 'Payment submitted! Waiting for confirmation...',
        type: 'info',
      });
    } catch (err) {
      // Error is already parsed and set in the hook
      console.error('Payment error:', err);
    }
  };

  // Success state with explorer link
  if (isSuccess && hash) {
    return (
      <div style={{ background: '#00ff00', border: '2px solid #008000', padding: '8px', fontSize: '11px', textAlign: 'center', fontFamily: '"MS Sans Serif", sans-serif' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>✓ Payment Successful!</div>
        <a href={getExplorerUrl(hash)} target="_blank" rel="noopener noreferrer" style={{ color: '#0000ff', textDecoration: 'underline', fontSize: '10px' }}>
          View on Explorer →
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Loading share amount from contract */}
      {isLoadingShare && (
        <div style={{ background: '#ffffff', border: '1px solid #808080', padding: '8px', fontSize: '11px', fontFamily: '"MS Sans Serif", sans-serif' }}>
          Loading payment amount from contract...
        </div>
      )}

      {/* Payment amount display */}
      {weiAmount && !isLoadingShare && (
        <div style={{ background: '#e0ffe0', border: '1px solid #008000', padding: '8px', fontSize: '11px', fontFamily: '"MS Sans Serif", sans-serif' }}>
          <div style={{ marginBottom: '4px' }}>💰 Amount to pay: <strong>{formatEthAmount(ethAmount)} ETH</strong></div>
          <div style={{ fontSize: '10px', color: '#006600', marginBottom: '2px' }}>
            ≈ ${amount.toFixed(2)} USD (at time of bill creation)
          </div>
          {ethPrice && (
            <div style={{ fontSize: '10px', color: '#008000' }}>
              Current ETH price: ${ethPrice.toFixed(2)}
            </div>
          )}
        </div>
      )}

      {/* Gas estimate display */}
      {isConnected && !isWrongNetwork && !isSuccess && weiAmount && (
        <GasEstimateDisplay
          gasCostEth={gasCostEth}
          gasPriceGwei={gasPriceGwei}
          isHighGasPrice={isHighGasPrice}
          isLoading={isEstimatingGas}
        />
      )}

      {/* Error display */}
      {showError && error && (
        <div style={{ background: '#ffcccc', border: '2px solid #ff0000', padding: '8px', fontSize: '11px', fontFamily: '"MS Sans Serif", sans-serif' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{error.title}</div>
          <div style={{ fontSize: '10px', marginBottom: '4px' }}>{error.message}</div>
          {error.action && (
            <div style={{ fontSize: '10px', color: '#cc0000' }}>{error.action}</div>
          )}
        </div>
      )}

      {/* Network warning */}
      {isConnected && isWrongNetwork && (
        <div style={{ background: '#ffff00', border: '2px solid #ff8800', padding: '8px', fontSize: '11px', fontFamily: '"MS Sans Serif", sans-serif' }}>
          ⚠️ Wrong network detected. Click the button to switch to Base Sepolia.
        </div>
      )}

      {/* Wallet connection warning */}
      {!isConnected && (
        <div style={{ background: '#ffff00', border: '2px solid #ff8800', padding: '8px', fontSize: '11px', fontFamily: '"MS Sans Serif", sans-serif' }}>
          ⚠️ Please connect your wallet to make a payment.
        </div>
      )}

      {/* Payment button */}
      <button
        onClick={handlePay}
        disabled={disabled || isPending || isConfirming || isLoadingShare || !weiAmount}
        className="retro-button"
        style={{ width: '100%' }}
      >
        {isPending || isConfirming
          ? isPending
            ? 'Confirm in wallet...'
            : 'Processing transaction...'
          : isLoadingShare
            ? 'Loading amount...'
            : isWrongNetwork
              ? 'Switch Network & Pay'
              : `Pay ${formatEthAmount(ethAmount)} ETH`}
      </button>

      {/* Pending transaction info */}
      {isPending && !hash && (
        <div style={{ background: '#e0e0ff', border: '1px solid #8080ff', padding: '8px', fontSize: '11px', fontFamily: '"MS Sans Serif", sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', border: '2px solid #0000ff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div>Confirm transaction in your wallet...</div>
        </div>
      )}

      {isConfirming && hash && (
        <div style={{ background: '#e0e0ff', border: '1px solid #8080ff', padding: '8px', fontSize: '11px', fontFamily: '"MS Sans Serif", sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '12px', height: '12px', border: '2px solid #0000ff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <strong>Transaction pending...</strong>
          </div>
          <div style={{ fontSize: '10px', marginBottom: '6px' }}>Waiting for blockchain confirmation</div>

          {showSlowWarning && (
            <div style={{ background: '#ffff00', border: '1px solid #ff8800', padding: '6px', marginBottom: '6px', fontSize: '10px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>⚠️ Network Congestion</div>
              <div>Transaction is taking longer than usual. This is normal during high network activity.</div>
            </div>
          )}

          <a href={getExplorerUrl(hash)} target="_blank" rel="noopener noreferrer" style={{ color: '#0000ff', textDecoration: 'underline', fontSize: '10px' }}>
            View transaction →
          </a>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
