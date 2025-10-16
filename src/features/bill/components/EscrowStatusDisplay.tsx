'use client';

import { useEscrowStatus } from '@/features/payment/hooks/useEscrowStatus';
import { formatEscrowStatus, isEscrowComplete } from '@/lib/utils/escrow';
import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/utils/analytics';

interface EscrowStatusDisplayProps {
  escrowBillId: string;
}

export function EscrowStatusDisplay({
  escrowBillId,
}: EscrowStatusDisplayProps) {
  const { escrowStatus, isLoading } = useEscrowStatus(escrowBillId);
  const hasTrackedView = useRef(false);
  const hasTrackedSettlement = useRef(false);

  // Track status view (once per mount)
  useEffect(() => {
    if (!hasTrackedView.current && escrowStatus) {
      trackEvent('escrow_status_viewed', {
        billId: escrowBillId,
        paidCount: escrowStatus.paidCount,
        participantCount: escrowStatus.participantCount,
        settled: escrowStatus.settled,
      });
      hasTrackedView.current = true;
    }
  }, [escrowStatus, escrowBillId]);

  // Track bill settlement
  useEffect(() => {
    if (!hasTrackedSettlement.current && escrowStatus?.settled) {
      trackEvent('escrow_bill_settled', {
        billId: escrowBillId,
        participantCount: escrowStatus.participantCount,
      });
      hasTrackedSettlement.current = true;
    }
  }, [escrowStatus, escrowBillId]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2 rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>
    );
  }

  // Warning when status unavailable
  if (!escrowStatus) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
        ⚠️ Escrow status unavailable
      </div>
    );
  }

  const isComplete = isEscrowComplete(
    escrowStatus.paidCount,
    escrowStatus.participantCount,
  );

  // Determine status badge
  const getStatusBadge = () => {
    if (escrowStatus.settled) {
      return (
        <span className="rounded bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Settled
        </span>
      );
    }
    if (isComplete) {
      return (
        <span className="rounded bg-yellow-100 px-2 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          Awaiting Settlement
        </span>
      );
    }
    return (
      <span className="rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
        In Progress
      </span>
    );
  };

  return (
    <div className="space-y-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Escrow Status:
        </span>
        {getStatusBadge()}
      </div>

      <div className="text-sm text-slate-600 dark:text-slate-400">
        <p>
          Payments:{' '}
          <span className="font-medium">
            {formatEscrowStatus(
              escrowStatus.paidCount,
              escrowStatus.participantCount,
            )}
          </span>
        </p>
      </div>

      {escrowStatus.settled && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
          <p className="text-sm font-semibold text-green-900 dark:text-green-100">
            ✅ Bill Settled Successfully!
          </p>
          <p className="mt-1 text-xs text-green-700 dark:text-green-300">
            All funds have been automatically transferred to the bill creator. The escrow contract has completed its job.
          </p>
        </div>
      )}

      {isComplete && !escrowStatus.settled && (
        <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
          <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
            ⏳ Settlement in Progress...
          </p>
          <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
            All participants have paid! The contract is automatically transferring funds to the bill creator.
          </p>
        </div>
      )}
    </div>
  );
}
