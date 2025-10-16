'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/LoadingSkeleton';

// Lazy load the EscrowPaymentButton component
const EscrowPaymentButton = dynamic(
  () => import('./EscrowPaymentButton').then((mod) => ({ default: mod.EscrowPaymentButton })),
  {
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <LoadingSpinner size="sm" />
        <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
          Loading payment options...
        </span>
      </div>
    ),
    ssr: false, // Disable SSR for wallet-dependent component
  }
);

export { EscrowPaymentButton };
