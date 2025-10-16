'use client';

import { useEscrowPaymentStatus } from '@/features/payment/hooks/useEscrowBillData';

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
        {isLoading ? (
          <span style={{ fontSize: '10px' }}>⏳</span>
        ) : hasPaid ? (
          <span style={{ color: '#00ff00', fontWeight: 'bold' }}>✓</span>
        ) : (
          <span style={{ color: '#ff0000', fontWeight: 'bold' }}>✗</span>
        )}
        <span>{participantName}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>${amount.toFixed(2)}</span>
        {!isLoading && (
          <span
            style={{
              fontSize: '9px',
              padding: '2px 4px',
              background: hasPaid ? '#00ff00' : '#ff0000',
              color: '#000000',
              fontWeight: 'bold',
            }}
          >
            {hasPaid ? 'PAID' : 'UNPAID'}
          </span>
        )}
      </div>
    </div>
  );
}
