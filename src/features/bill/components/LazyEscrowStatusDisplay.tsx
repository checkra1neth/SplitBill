'use client';

import dynamic from 'next/dynamic';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

// Lazy load the EscrowStatusDisplay component
const EscrowStatusDisplay = dynamic(
  () => import('./EscrowStatusDisplay').then((mod) => ({ default: mod.EscrowStatusDisplay })),
  {
    loading: () => (
      <div className="animate-pulse space-y-2 rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
        <LoadingSkeleton lines={2} />
      </div>
    ),
    ssr: false, // Disable SSR for contract-dependent component
  }
);

export { EscrowStatusDisplay };
