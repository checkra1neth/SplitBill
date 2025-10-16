'use client';

import { useEscrowPaymentStatus } from '@/features/payment/hooks/useEscrowBillData';
import { useEffect, useRef } from 'react';
import { useToast } from '@/lib/providers/ToastProvider';

interface EscrowPaymentProgressProps {
  escrowBillId: string;
  participants: Array<{ address: string }>;
  onAllPaid?: () => void;
}

export function EscrowPaymentProgress({
  escrowBillId,
  participants,
  onAllPaid,
}: EscrowPaymentProgressProps) {
  const { showToast } = useToast();
  const hasNotifiedRef = useRef(false);
  
  // Get payment status for all participants
  const paymentStatuses = participants.map((p) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { hasPaid, isLoading } = useEscrowPaymentStatus(
      escrowBillId,
      p.address as `0x${string}`
    );
    return { hasPaid, isLoading };
  });

  const isLoading = paymentStatuses.some((s) => s.isLoading);
  const paidCount = paymentStatuses.filter((s) => s.hasPaid).length;
  const totalCount = participants.length;
  const allPaid = paidCount === totalCount && totalCount > 0;

  // Notify when all participants have paid
  useEffect(() => {
    if (allPaid && !hasNotifiedRef.current && !isLoading) {
      hasNotifiedRef.current = true;
      showToast({
        message: '🎉 All participants have paid! Bill is complete.',
        type: 'success',
      });
      onAllPaid?.();
    }
  }, [allPaid, isLoading, showToast, onAllPaid]);

  if (isLoading) {
    return (
      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
        Loading payment status...
      </div>
    );
  }

  return (
    <div style={{ marginTop: '6px' }}>
      <div
        style={{
          fontSize: '10px',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontWeight: 'bold' }}>Payment Status:</span>
        <span style={{ color: allPaid ? '#00ff00' : '#ff8800', fontWeight: 'bold' }}>
          {allPaid ? '✓ Complete' : `${paidCount} / ${totalCount} paid`}
        </span>
      </div>
      {/* Progress bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #808080',
          height: '12px',
          position: 'relative',
        }}
      >
        <div
          style={{
            background: allPaid ? '#00ff00' : '#0000ff',
            height: '100%',
            width: `${(paidCount / totalCount) * 100}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
