'use client';

import { useState } from 'react';
import { useBillMetadata, useRateBill } from '@/features/bill/hooks/useBillMetadata';
import { useToast } from '@/lib/providers/ToastProvider';

interface BillRatingProps {
  billId: string;
}

export function BillRating({ billId }: BillRatingProps) {
  const { rating, isLoading } = useBillMetadata(billId);
  const { rateBill, isPending } = useRateBill();
  const { showToast } = useToast();
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleRate = async (stars: number) => {
    try {
      await rateBill(billId, stars);
      showToast({
        message: `Rated ${stars} stars!`,
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to rate:', error);
      showToast({
        message: 'Failed to rate bill',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return <div style={{ fontSize: '11px' }}>Loading rating...</div>;
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #808080',
        padding: '12px',
        fontSize: '11px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Rate this bill:</div>

      {/* Current rating */}
      {rating && rating.count > 0 && (
        <div style={{ marginBottom: '8px', fontSize: '10px', color: '#666' }}>
          Average: {rating.average.toFixed(1)} ⭐ ({rating.count} rating{rating.count !== 1 ? 's' : ''})
        </div>
      )}

      {/* Star rating */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            disabled={isPending}
            style={{
              fontSize: '24px',
              background: 'none',
              border: 'none',
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.5 : 1,
              filter: star <= (hoveredStar || 0) ? 'none' : 'grayscale(100%)',
            }}
          >
            ⭐
          </button>
        ))}
      </div>

      {isPending && (
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
          Submitting rating...
        </div>
      )}
    </div>
  );
}
