'use client';

import dynamic from 'next/dynamic';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

// Lazy load the EscrowToggle component
const EscrowToggle = dynamic(
  () => import('./EscrowToggle').then((mod) => ({ default: mod.EscrowToggle })),
  {
    loading: () => (
      <div className="space-y-2">
        <LoadingSkeleton lines={1} className="h-6" />
      </div>
    ),
    ssr: false, // Disable SSR for wallet-dependent component
  }
);

export { EscrowToggle };
