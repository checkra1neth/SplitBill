'use client';

import { useEscrowStatus } from '@/features/payment/hooks/useEscrowStatus';
import { formatDistanceToNow } from 'date-fns';

interface EscrowDeadlineDisplayProps {
  escrowBillId: string;
}

/**
 * Display escrow deadline and countdown timer
 */
export function EscrowDeadlineDisplay({
  escrowBillId,
}: EscrowDeadlineDisplayProps) {
  const { escrowStatus, isLoading } = useEscrowStatus(escrowBillId);

  if (isLoading) {
    return <div className="animate-pulse h-6 bg-gray-200 rounded w-48"></div>;
  }

  if (!escrowStatus) return null;

  const { deadline, paidCount, participantCount, settled, cancelled } =
    escrowStatus;

  // Don't show if settled or cancelled
  if (settled || cancelled) return null;

  const deadlineDate = new Date(deadline * 1000);
  const now = Date.now();
  const isExpired = now > deadline * 1000;
  const allPaid = paidCount === participantCount;

  // Don't show if all paid (will auto-settle)
  if (allPaid) return null;

  const timeRemaining = isExpired
    ? 'Expired'
    : formatDistanceToNow(deadlineDate, { addSuffix: true });

  const urgencyLevel = (() => {
    if (isExpired) return 'expired';
    const hoursRemaining = (deadline * 1000 - now) / (1000 * 60 * 60);
    if (hoursRemaining < 24) return 'urgent';
    if (hoursRemaining < 72) return 'warning';
    return 'normal';
  })();

  const icons = {
    expired: '⏰',
    urgent: '⚠️',
    warning: '⏳',
    normal: '📅',
  };

  const bgColor = {
    expired: '#ff0000',
    urgent: '#ff8800',
    warning: '#ffff00',
    normal: '#c0c0c0',
  };

  const textColor = {
    expired: '#ffffff',
    urgent: '#000000',
    warning: '#000000',
    normal: '#000000',
  };

  return (
    <div className="retro-window">
      <div className="retro-title-bar">
        <div className="retro-title-text">
          <span>{icons[urgencyLevel]} {isExpired ? 'Deadline Expired' : 'Payment Deadline'}</span>
        </div>
      </div>
      <div 
        className="retro-content" 
        style={{ 
          background: bgColor[urgencyLevel],
          color: textColor[urgencyLevel],
          padding: '12px'
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
          {timeRemaining}
        </div>

        {isExpired && (
          <div style={{ fontSize: '11px', marginTop: '8px' }}>
            Payment deadline has expired. Creator can initiate automatic refund.
          </div>
        )}

        {urgencyLevel === 'urgent' && !isExpired && (
          <div style={{ fontSize: '11px', marginTop: '8px' }}>
            ⚡ Less than 24 hours remaining! Please pay soon.
          </div>
        )}
      </div>
    </div>
  );
}
