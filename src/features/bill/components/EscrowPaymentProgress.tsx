'use client';

import { useEscrowPaymentStatus, useEscrowBillInfo } from '@/features/payment/hooks/useEscrowBillData';
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
  const { cancelled, settled } = useEscrowBillInfo(escrowBillId);
  
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

  // Determine status message and color based on bill state
  let statusMessage = `${paidCount} / ${totalCount} paid`;
  let statusColor = '#ff8800';
  let progressColor = '#0000ff';

  if (cancelled) {
    statusMessage = '✗ Cancelled - Refunds Available';
    statusColor = '#ff0000';
    progressColor = '#ff0000';
  } else if (settled || allPaid) {
    statusMessage = '✓ Complete';
    statusColor = '#00ff00';
    progressColor = '#00ff00';
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
        <span style={{ color: statusColor, fontWeight: 'bold' }}>
          {statusMessage}
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
            background: progressColor,
            height: '100%',
            width: cancelled ? '100%' : `${(paidCount / totalCount) * 100}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
