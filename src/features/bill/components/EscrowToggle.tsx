'use client';

import { useState } from 'react';
import { isEscrowAvailable } from '@/lib/config/escrow';
import { useAccount } from 'wagmi';
import { trackEvent } from '@/lib/utils/analytics';

interface EscrowToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function EscrowToggle({ enabled, onChange }: EscrowToggleProps) {
  const { isConnected } = useAccount();
  const [showInfo, setShowInfo] = useState(false);

  // Hide component when escrow not available
  if (!isEscrowAvailable()) {
    return null;
  }

  const handleToggle = (checked: boolean) => {
    onChange(checked);
    // Track analytics
    trackEvent(checked ? 'escrow_toggle_enabled' : 'escrow_toggle_disabled');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={!isConnected}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Use Escrow Protection
          </span>
        </label>
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          What&apos;s this?
        </button>
      </div>

      {showInfo && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-slate-700 dark:bg-blue-900/20 dark:text-slate-300">
          <p className="mb-2 font-semibold">Escrow Protection:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Funds locked until everyone pays</li>
            <li>Automatic settlement when complete</li>
            <li>On-chain proof of payment</li>
            <li>Trustless - no need to trust the bill creator</li>
          </ul>
          
          <div className="mt-3 border-t border-blue-200 pt-3 dark:border-blue-800">
            <p className="mb-1 font-semibold">Gas Costs:</p>
            <p className="text-xs leading-relaxed">
              Using escrow requires blockchain transactions, which incur small gas fees:
            </p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
              <li>Bill creator pays gas to create the escrow (~$0.01-0.05)</li>
              <li>Each participant pays gas when paying their share (~$0.01-0.03)</li>
              <li>Settlement happens automatically (no additional cost)</li>
            </ul>
            <p className="mt-2 text-xs italic text-blue-700 dark:text-blue-400">
              💡 These small fees provide security and transparency worth far more than their cost.
            </p>
          </div>
        </div>
      )}

      {!isConnected && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Connect wallet to enable escrow
        </p>
      )}
    </div>
  );
}
