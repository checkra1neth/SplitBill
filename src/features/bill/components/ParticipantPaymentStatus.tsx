'use client';

import { useEscrowPaymentStatus, useEscrowBillInfo, useCanRefund } from '@/features/payment/hooks/useEscrowBillData';

interface ParticipantPaymentStatusProps {
  escrowBillId: string;
  participantAddress: string;
  participantName: string;
  amount: number;
}

export function ParticipantPaymentStatus({
  escrowBillId,
  participantAddress,
  participantName,
  amount,
}: ParticipantPaymentStatusProps) {
  const { hasPaid, isLoading } = useEscrowPaymentStatus(
    escrowBillId,
    participantAddress as `0x${string}`
  );
  const { cancelled, settled } = useEscrowBillInfo(escrowBillId);
  const { canRefund } = useCanRefund(escrowBillId, participantAddress as `0x${string}`);

  // Determine status label and color
  let statusLabel = 'UNPAID';
  let statusBg = '#ff0000';
  let icon = '✗';
  let iconColor = '#ff0000';

  if (isLoading) {
    icon = '⏳';
    iconColor = '#666';
  } else if (cancelled && canRefund) {
    statusLabel = 'REFUND';
    statusBg = '#ff8800';
    icon = '↩';
    iconColor = '#ff8800';
  } else if (cancelled && hasPaid) {
    statusLabel = 'REFUNDED';
    statusBg = '#808080';
    icon = '✓';
    iconColor = '#808080';
  } else if (cancelled) {
    statusLabel = 'CANCELLED';
    statusBg = '#808080';
    icon = '✗';
    iconColor = '#808080';
  } else if (settled && hasPaid) {
    statusLabel = 'PAID';
    statusBg = '#00ff00';
    icon = '✓';
    iconColor = '#00ff00';
  } else if (hasPaid) {
    statusLabel = 'PAID';
    statusBg = '#00ff00';
    icon = '✓';
    iconColor = '#00ff00';
  }

  return (
    <div
      className="retro-list-item"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
        <span style={{ color: iconColor, fontWeight: 'bold', fontSize: '12px' }}>
          {icon}
        </span>
        <span>{participantName}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>${amount.toFixed(2)}</span>
        {!isLoading && (
          <span
            style={{
              fontSize: '9px',
              padding: '2px 4px',
              background: statusBg,
              color: '#000000',
              fontWeight: 'bold',
            }}
          >
            {statusLabel}
          </span>
        )}
      </div>
    </div>
  );
}
