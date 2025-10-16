/**
 * Transaction pending state component
 * Shows transaction status with explorer link and timeout warnings
 */

import { useEffect, useState } from 'react';
import { getExplorerUrl } from '@/lib/utils/escrow';
import { LoadingSpinner } from './LoadingSkeleton';

interface TransactionPendingProps {
  txHash: string;
  message?: string;
  showTimeoutWarning?: boolean;
  timeoutSeconds?: number;
}

export function TransactionPending({
  txHash,
  message = 'Transaction pending...',
  showTimeoutWarning = true,
  timeoutSeconds = 60,
}: TransactionPendingProps) {
  const [elapsed, setElapsed] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!showTimeoutWarning) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const newElapsed = prev + 1;
        if (newElapsed >= timeoutSeconds) {
          setShowWarning(true);
        }
        return newElapsed;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimeoutWarning, timeoutSeconds]);

  return (
    <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <div className="flex items-center gap-3">
        <LoadingSpinner size="sm" />
        <div className="flex-1">
          <p className="font-medium text-blue-800 dark:text-blue-300">
            {message}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Waiting for blockchain confirmation...
          </p>
        </div>
      </div>

      {showWarning && (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/20">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            ⚠️ Network Congestion Detected
          </p>
          <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
            Transaction is taking longer than usual. This is normal during high
            network activity. Your transaction will complete once confirmed.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-blue-600 dark:text-blue-400">
          Elapsed: {elapsed}s
        </span>
        <a
          href={getExplorerUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View on Explorer →
        </a>
      </div>
    </div>
  );
}

interface TransactionConfirmingProps {
  message?: string;
}

export function TransactionConfirming({
  message = 'Confirm transaction in your wallet',
}: TransactionConfirmingProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
      <LoadingSpinner size="sm" className="border-purple-600" />
      <div>
        <p className="font-medium text-purple-800 dark:text-purple-300">
          {message}
        </p>
        <p className="text-sm text-purple-600 dark:text-purple-400">
          Please check your wallet to approve the transaction
        </p>
      </div>
    </div>
  );
}
