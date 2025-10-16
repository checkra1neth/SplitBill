'use client';

import { useEscrow } from '@/features/payment/hooks/useEscrow';
import { useEscrowBillInfo, useCanRefund } from '@/features/payment/hooks/useEscrowBillData';
import { useAccount, useReadContract } from 'wagmi';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';
import { useState } from 'react';

interface RefundClaimButtonProps {
  escrowBillId: string;
}

/**
 * Button for participants to claim their refund after bill cancellation
 */
export function RefundClaimButton({ escrowBillId }: RefundClaimButtonProps) {
  const { address } = useAccount();
  const { cancelled } = useEscrowBillInfo(escrowBillId);
  const { canRefund } = useCanRefund(escrowBillId, address);
  const { refundParticipant, isPending, isConfirming, isSuccess, error } =
    useEscrow();
  const [claimed, setClaimed] = useState(false);

  // Get paid amount
  const { data: paidAmount } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'getPaidAmount',
    args:
      escrowBillId && address
        ? [escrowBillId as `0x${string}`, address as `0x${string}`]
        : undefined,
    query: {
      enabled: !!escrowBillId && !!address,
      refetchInterval: 5000, // Auto-update after refund
    },
  });

  if (!cancelled) return null;
  if (!canRefund || claimed || isSuccess) return null;
  if (!address) return null;

  const handleClaim = async () => {
    try {
      await refundParticipant(escrowBillId, address);
      setClaimed(true);
    } catch (err) {
      console.error('Refund claim failed:', err);
    }
  };

  const amountInEth = paidAmount
    ? (Number(paidAmount) / 1e18).toFixed(6)
    : '0';

  return (
    <div className="retro-window">
      <div className="retro-title-bar">
        <div className="retro-title-text">
          <span>💰 Refund Available</span>
        </div>
      </div>
      <div className="retro-content" style={{ padding: '12px' }}>
        <div style={{ 
          background: '#00ff00',
          border: '2px solid #008000',
          padding: '8px',
          marginBottom: '12px',
          fontSize: '11px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Bill cancelled. You can claim your refund.
          </div>
        </div>

        {paidAmount && paidAmount > BigInt(0) && (
          <div className="retro-group" style={{ marginBottom: '12px' }}>
            <div className="retro-group-title">Refund Amount</div>
            <div style={{ padding: '8px', fontSize: '11px' }}>
              <strong>{amountInEth} ETH</strong>
            </div>
          </div>
        )}

        {error && (
          <div style={{ 
            background: '#ff0000',
            color: '#ffffff',
            border: '2px solid #800000',
            padding: '8px',
            marginBottom: '12px',
            fontSize: '11px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{error.title}</div>
            <div>{error.message}</div>
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={isPending || isConfirming}
          className="retro-button"
          style={{ width: '100%', marginBottom: '8px' }}
        >
          {isPending || isConfirming ? 'Processing...' : '✓ Claim Refund'}
        </button>

        <p style={{ fontSize: '10px', textAlign: 'center', color: '#666' }}>
          Funds will be returned to your wallet
        </p>
      </div>
    </div>
  );
}
