'use client';

import { useEscrow } from '@/features/payment/hooks/useEscrow';
import { useEscrowStatus } from '@/features/payment/hooks/useEscrowStatus';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface EscrowManagementPanelProps {
  escrowBillId: string;
  creatorAddress: string;
}

/**
 * Management panel for escrow bills - allows creator to cancel, refund, or partially settle
 */
export function EscrowManagementPanel({
  escrowBillId,
  creatorAddress,
}: EscrowManagementPanelProps) {
  const { address } = useAccount();
  const { escrowStatus, isLoading } = useEscrowStatus(escrowBillId);
  const {
    cancelAndRefund,
    autoRefundIfExpired,
    partialSettle,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = useEscrow();

  const [showConfirm, setShowConfirm] = useState<
    'cancel' | 'partial' | 'autoRefund' | null
  >(null);

  // Only show to creator
  const isCreator = address?.toLowerCase() === creatorAddress.toLowerCase();
  if (!isCreator) return null;

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!escrowStatus) return null;

  const { paidCount, participantCount, settled, cancelled, deadline } = escrowStatus;
  const isExpired = deadline > 0 && Date.now() / 1000 > deadline;
  const allPaid = paidCount === participantCount;
  const somePaid = paidCount > 0 && paidCount < participantCount;

  // Don't show if already settled or cancelled
  if (settled || cancelled) return null;

  const handleCancelAndRefund = async () => {
    try {
      await cancelAndRefund(escrowBillId);
      setShowConfirm(null);
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  const handleAutoRefund = async () => {
    try {
      await autoRefundIfExpired(escrowBillId);
      setShowConfirm(null);
    } catch (err) {
      console.error('Auto refund failed:', err);
    }
  };

  const handlePartialSettle = async () => {
    try {
      await partialSettle(escrowBillId);
      setShowConfirm(null);
    } catch (err) {
      console.error('Partial settle failed:', err);
    }
  };

  const deadlineDate = new Date(deadline * 1000);
  const timeRemaining = isExpired
    ? 'Expired'
    : formatDistanceToNow(deadlineDate, { addSuffix: true });

  return (
    <div className="retro-window">
      <div className="retro-title-bar">
        <div className="retro-title-text">
          <span>⚙️ Escrow Management</span>
        </div>
      </div>
      <div className="retro-content" style={{ padding: '12px' }}>
        {/* Status Info */}
        <div className="retro-group" style={{ marginBottom: '12px' }}>
          <div className="retro-group-title">Status</div>
          <div style={{ padding: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
              <span>Paid:</span>
              <strong>
                {paidCount} / {participantCount}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span>Deadline:</span>
              <strong style={{ color: isExpired ? '#ff0000' : '#000000' }}>
                {timeRemaining}
              </strong>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div style={{ 
            background: '#00ff00', 
            border: '2px solid #008000',
            padding: '8px',
            marginBottom: '12px',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            ✓ Operation completed successfully!
          </div>
        )}

        {/* Error Message */}
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

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Auto Refund (if expired) */}
          {isExpired && somePaid && (
            <div>
              {showConfirm === 'autoRefund' ? (
                <div style={{ 
                  background: '#ffff00',
                  border: '2px solid #808080',
                  padding: '8px',
                  marginBottom: '8px'
                }}>
                  <p style={{ fontSize: '11px', marginBottom: '8px' }}>
                    Deadline expired. Refund all participants?
                  </p>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={handleAutoRefund}
                      disabled={isPending || isConfirming}
                      className="retro-button"
                      style={{ flex: 1 }}
                    >
                      {isPending || isConfirming ? 'Processing...' : 'Yes, Refund'}
                    </button>
                    <button
                      onClick={() => setShowConfirm(null)}
                      className="retro-button"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirm('autoRefund')}
                  className="retro-button"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <span>⏰</span>
                  <span>Auto Refund (expired)</span>
                </button>
              )}
            </div>
          )}

          {/* Partial Settlement (if some paid but not all) */}
          {somePaid && !allPaid && (
            <div>
              {showConfirm === 'partial' ? (
                <div style={{ 
                  background: '#c0c0c0',
                  border: '2px solid #808080',
                  padding: '8px',
                  marginBottom: '8px'
                }}>
                  <p style={{ fontSize: '11px', marginBottom: '8px' }}>
                    Settle bill with {paidCount} participants? Others will be excluded.
                  </p>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={handlePartialSettle}
                      disabled={isPending || isConfirming}
                      className="retro-button"
                      style={{ flex: 1 }}
                    >
                      {isPending || isConfirming ? 'Processing...' : 'Yes, Settle'}
                    </button>
                    <button
                      onClick={() => setShowConfirm(null)}
                      className="retro-button"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirm('partial')}
                  className="retro-button"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <span>💰</span>
                  <span>Partial Settlement ({paidCount} paid)</span>
                </button>
              )}
            </div>
          )}

          {/* Cancel and Refund (always available) */}
          <div>
            {showConfirm === 'cancel' ? (
              <div style={{ 
                background: '#ff0000',
                color: '#ffffff',
                border: '2px solid #800000',
                padding: '8px',
                marginBottom: '8px'
              }}>
                <p style={{ fontSize: '11px', marginBottom: '8px' }}>
                  Cancel bill and refund all participants?
                </p>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={handleCancelAndRefund}
                    disabled={isPending || isConfirming}
                    className="retro-button"
                    style={{ flex: 1 }}
                  >
                    {isPending || isConfirming ? 'Processing...' : 'Yes, Cancel'}
                  </button>
                  <button
                    onClick={() => setShowConfirm(null)}
                    className="retro-button"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm('cancel')}
                className="retro-button"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <span>❌</span>
                <span>Cancel & Refund</span>
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="retro-group" style={{ marginTop: '12px' }}>
          <div className="retro-group-title">ℹ️ Information</div>
          <div style={{ padding: '8px', fontSize: '10px' }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Cancel:</strong> Refunds all participants who paid
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Partial Settlement:</strong> Receive funds from those who paid
            </div>
            <div>
              <strong>Auto-Refund:</strong> Available after deadline expires
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
