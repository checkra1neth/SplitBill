'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Bill } from '@/lib/types/bill';
import { useEscrow } from '@/features/payment/hooks/useEscrow';
import { calculateParticipantShares } from '@/lib/utils/calculations';
import { useToast } from '@/lib/providers/ToastProvider';

interface ActivateEscrowButtonProps {
  bill: Bill;
  onActivated?: () => void;
  updateEscrowMetadata: (escrowBillId: string, escrowTxHash: string) => void;
  ethPrice?: number | null;
  isPriceLoading?: boolean;
  priceError?: Error | null;
}

export function ActivateEscrowButton({
  bill,
  onActivated,
  updateEscrowMetadata,
  ethPrice,
  isPriceLoading = false,
  priceError = null,
}: ActivateEscrowButtonProps) {
  const { createEscrowBill, isPending, isConfirming, isSuccess, hash } = useEscrow();
  const { showToast } = useToast();
  const [hasActivated, setHasActivated] = useState(false);
  const [pendingEscrowBillId, setPendingEscrowBillId] = useState<string | null>(null);
  const hasUpdated = useRef(false);

  // Check if escrow can be activated
  const canActivate =
    bill.escrowEnabled &&
    !bill.escrowBillId && // Not already activated
    bill.items.length > 0 && // Has items
    bill.participants.length > 0 && // Has participants
    !hasActivated;

  // Check if all shares are valid (> 0)
  const shares = calculateParticipantShares(bill);
  const payableShares = useMemo(
    () => shares.filter((share) => share.amount > 0),
    [shares],
  );
  const hasValidShares = payableShares.length > 0;

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash && pendingEscrowBillId && !hasUpdated.current) {
      hasUpdated.current = true;
      
      // Update bill with escrow metadata
      updateEscrowMetadata(pendingEscrowBillId, hash);
      setHasActivated(true);

      showToast({
        message: 'Escrow activated successfully!',
        type: 'success',
      });

      // Refresh bill data to show updated state
      onActivated?.();
    }
  }, [isSuccess, hash, pendingEscrowBillId, updateEscrowMetadata, showToast, onActivated]);

  const handleActivate = async () => {
    if (!canActivate || !hasValidShares) return;

    if (isPriceLoading) {
      showToast({
        message: 'Fetching latest ETH price. Please try again in a moment.',
        type: 'info',
      });
      return;
    }

    if (!ethPrice) {
      showToast({
        message:
          priceError?.message ?? 'Unable to fetch ETH price. Check your connection and try again.',
        type: 'error',
      });
      return;
    }

    try {
      showToast({
        message: `Activating escrow... ETH price: $${ethPrice.toFixed(2)}`,
        type: 'info',
      });

      // Get beneficiary from localStorage if it was set during bill creation
      const storedBeneficiary = localStorage.getItem('pendingBeneficiary');
      const beneficiary = storedBeneficiary || undefined;

      // Create escrow bill in contract (it will fetch real-time ETH price internally)
      const escrowBillId = await createEscrowBill(bill, payableShares, beneficiary);

      if (escrowBillId) {
        setPendingEscrowBillId(escrowBillId);
        
        // Clear stored beneficiary after use
        if (storedBeneficiary) {
          localStorage.removeItem('pendingBeneficiary');
        }
        
        showToast({
          message: 'Transaction submitted! Waiting for confirmation...',
          type: 'info',
        });
      }
    } catch (error) {
      console.error('Failed to activate escrow:', error);
      showToast({
        message: 'Failed to activate escrow. Please try again.',
        type: 'error',
      });
    }
  };

  // Don't show if escrow is not enabled or already activated
  if (!bill.escrowEnabled || bill.escrowBillId || hasActivated) {
    return null;
  }

  // Show message if can't activate yet
  if (!canActivate || !hasValidShares) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #808080',
        padding: '8px',
        fontSize: '11px',
        fontFamily: '"MS Sans Serif", "Microsoft Sans Serif", sans-serif'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ fontSize: '16px' }}>🔐</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              Escrow Protection Enabled
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>
              {bill.items.length === 0 && 'Add items to activate escrow protection'}
              {bill.items.length > 0 && !hasValidShares &&
                'Distribute items so at least one participant owes a share before activating escrow'}
              {bill.items.length > 0 && hasValidShares && 'Ready to activate escrow protection'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #808080',
      padding: '8px',
      fontSize: '11px',
      fontFamily: '"MS Sans Serif", "Microsoft Sans Serif", sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ fontSize: '16px' }}>🔐</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Ready to Activate Escrow Protection
          </div>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '6px' }}>
            Your bill is ready! Activate escrow to lock funds until everyone pays.
          </div>
          {ethPrice && !isPriceLoading && (
            <div style={{ fontSize: '10px', color: '#0000ff', marginBottom: '6px' }}>
              💱 Current ETH price: ${ethPrice.toFixed(2)} (real-time)
            </div>
          )}
          {priceError && !isPriceLoading && !ethPrice && (
            <div style={{ fontSize: '10px', color: '#ff0000', marginBottom: '6px' }}>
              {priceError.message || 'Unable to fetch live ETH price. Please check your internet connection.'}
            </div>
          )}
          <button
            onClick={handleActivate}
            disabled={isPending || isConfirming || isPriceLoading || !ethPrice}
            style={{
              width: '100%',
              background: '#c0c0c0',
              borderTop: '2px solid #ffffff',
              borderLeft: '2px solid #ffffff',
              borderRight: '2px solid #000000',
              borderBottom: '2px solid #000000',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 'normal',
              cursor: isPending || isConfirming || isPriceLoading || !ethPrice ? 'not-allowed' : 'pointer',
              color: isPending || isConfirming || isPriceLoading || !ethPrice ? '#808080' : '#000000'
            }}
          >
            {isPending || isConfirming 
              ? 'Activating...' 
              : isPriceLoading 
                ? 'Loading price...' 
                : 'Activate Escrow Protection'}
          </button>
        </div>
      </div>
    </div>
  );
}
