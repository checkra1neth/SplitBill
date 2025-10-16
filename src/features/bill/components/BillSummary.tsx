'use client';

import { useCallback, useMemo, useState } from 'react';
import { Bill } from '@/lib/types/bill';
import { calculateParticipantShares, formatCurrency } from '@/lib/utils/calculations';
import {
  SUPPORTED_CURRENCIES,
  convertFromUsd,
  type SupportedCurrency,
} from '@/lib/utils/currency';
import { EscrowStatusDisplay } from './LazyEscrowStatusDisplay';
import { getExplorerUrl } from '@/lib/utils/escrow';
import { useParticipantPaymentStatus } from '@/features/payment/hooks/useParticipantPaymentStatus';

interface BillSummaryProps {
  bill: Bill;
}

function ParticipantPaymentStatus({ 
  escrowBillId, 
  participantAddress 
}: { 
  escrowBillId: string; 
  participantAddress: string;
}) {
  const { hasPaid, isLoading } = useParticipantPaymentStatus(escrowBillId, participantAddress);

  if (isLoading) {
    return (
      <span className="text-xs text-slate-400 dark:text-slate-500">
        Loading...
      </span>
    );
  }

  if (hasPaid) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
        ✓ Paid
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
      Pending
    </span>
  );
}

export function BillSummary({ bill }: BillSummaryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('USD');
  const shares = useMemo(() => calculateParticipantShares(bill), [bill]);
  const total = shares.reduce((sum, share) => sum + share.amount, 0);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const formatAmount = useCallback(
    (amount: number) => {
      const converted = convertFromUsd(amount, selectedCurrency);
      const primary = formatCurrency(converted, selectedCurrency);
      if (selectedCurrency === 'USD') {
        return primary;
      }
      const usdValue = formatCurrency(amount, 'USD');
      return `${primary} (${usdValue})`;
    },
    [selectedCurrency],
  );

  const filteredShares = useMemo(() => {
    if (!normalizedQuery) {
      return shares;
    }

    return shares.filter((share) => {
      const participant = bill.participants.find((p) => p.id === share.participantId);
      if (!participant) return false;

      const tokens = [
        participant.name?.toLowerCase() ?? '',
        participant.basename?.toLowerCase() ?? '',
        participant.address.toLowerCase(),
      ];

      return tokens.some((token) => token.includes(normalizedQuery));
    });
  }, [shares, bill.participants, normalizedQuery]);

  return (
    <div className="space-y-4 rounded-lg bg-white p-6 shadow dark:bg-slate-800 dark:text-slate-100 dark:shadow-slate-900/40">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{bill.title}</h2>
        {bill.escrowEnabled && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            🔒 Escrow Protected
          </span>
        )}
      </div>

      {bill.escrowEnabled && bill.escrowTxHash && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-900/20">
          <p className="text-slate-700 dark:text-slate-300">
            <span className="font-medium">Creation Transaction:</span>{' '}
            <a
              href={getExplorerUrl(bill.escrowTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View on Explorer →
            </a>
          </p>
        </div>
      )}

      {bill.escrowEnabled && bill.escrowBillId && (
        <EscrowStatusDisplay escrowBillId={bill.escrowBillId} />
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Items</h3>
        {bill.items.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No items yet.</p>
        ) : (
          bill.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span>{item.description}</span>
              <span className="font-medium">{formatAmount(item.amount)}</span>
            </div>
          ))
        )}
      </div>

      <div className="space-y-1 border-t border-slate-100 pt-2 text-sm dark:border-slate-700">
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatAmount(bill.tax)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tip</span>
          <span>{formatAmount(bill.tip)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatAmount(total)}</span>
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">Split</h3>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="currency" className="text-slate-500 dark:text-slate-400">
              Currency
            </label>
            <select
              id="currency"
              value={selectedCurrency}
              onChange={(event) => setSelectedCurrency(event.target.value as SupportedCurrency)}
              className="rounded border border-slate-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name, Basename, or address"
          className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400"
        />
        {filteredShares.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No participants match your search.</p>
        ) : (
          filteredShares.map((share) => {
            const participant = bill.participants.find((p) => p.id === share.participantId);
            const displayName = participant?.name ||
              participant?.basename ||
              `${participant?.address.slice(0, 6)}...${participant?.address.slice(-4)}`;
            
            return (
              <div key={share.participantId} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm truncate">
                    {displayName}
                  </span>
                  {bill.escrowEnabled && bill.escrowBillId && participant && (
                    <ParticipantPaymentStatus
                      escrowBillId={bill.escrowBillId}
                      participantAddress={participant.address}
                    />
                  )}
                </div>
                <span className="text-sm font-semibold whitespace-nowrap">{formatAmount(share.amount)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
