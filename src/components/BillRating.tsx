'use client';

import { useState, useEffect } from 'react';
import { useBillMetadata, useRateBill } from '@/features/bill/hooks/useBillMetadata';
import { useToast } from '@/lib/providers/ToastProvider';

interface BillRatingProps {
  billId: string;
}

export function BillRating({ billId }: BillRatingProps) {
  const { rating, isLoading, refetch } = useBillMetadata(billId);
  const { rateBill, isPending, isConfirming, isSuccess } = useRateBill();
  const { showToast } = useToast();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [myRating, setMyRating] = useState(0); // Store user's selected rating
  const [hasNotifiedSuccess, setHasNotifiedSuccess] = useState(false);

  // Load saved rating from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRating = localStorage.getItem(`bill-rating-${billId}`);
      if (savedRating) {
        const rating = parseInt(savedRating, 10);
        if (rating >= 1 && rating <= 5) {
          setMyRating(rating);
          setHasRated(true);
        }
      }
    }
  }, [billId]);

  // Handle successful rating
  useEffect(() => {
    if (isSuccess && !hasNotifiedSuccess) {
      setHasNotifiedSuccess(true);
      setHasRated(true);
      
      // Save rating to localStorage
      if (typeof window !== 'undefined' && myRating > 0) {
        localStorage.setItem(`bill-rating-${billId}`, myRating.toString());
      }
      
      showToast({
        message: 'Rating submitted successfully!',
        type: 'success',
      });
      
      // Refetch rating data after successful transaction
      console.log('Rating transaction confirmed! Refreshing rating data...');
      refetch();
      
      // Refetch multiple times to ensure blockchain state is updated
      const timers = [
        setTimeout(() => {
          console.log('Refetching rating (attempt 1)...');
          refetch();
        }, 1000),
        setTimeout(() => {
          console.log('Refetching rating (attempt 2)...');
          refetch();
        }, 2000),
        setTimeout(() => {
          console.log('Refetching rating (attempt 3)...');
          refetch();
        }, 3000),
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [isSuccess, hasNotifiedSuccess, showToast, refetch, billId, myRating]);

  const handleRate = async (stars: number) => {
    if (hasRated) {
      showToast({
        message: 'You have already rated this bill',
        type: 'info',
      });
      return;
    }

    try {
      setMyRating(stars); // Save the selected rating
      setHasNotifiedSuccess(false);
      await rateBill(billId, stars);
      showToast({
        message: 'Submitting rating... confirm in your wallet',
        type: 'info',
      });
    } catch (error) {
      console.error('Failed to rate:', error);
      setMyRating(0); // Reset on error
      showToast({
        message: error instanceof Error ? error.message : 'Failed to rate bill',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return <div style={{ fontSize: '11px' }}>Loading rating...</div>;
  }

  const isProcessing = isPending || isConfirming;

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

      {/* Already rated message */}
      {hasRated && myRating > 0 && (
        <div style={{ 
          marginBottom: '8px', 
          padding: '8px',
          background: '#fffacd', 
          border: '1px solid #ffd700',
          fontSize: '10px',
          color: '#b8860b'
        }}>
          ✓ Your rating: {myRating} star{myRating !== 1 ? 's' : ''}
        </div>
      )}

      {/* Star rating */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map(star => {
          // Determine if this star should be golden
          const isSelected = hasRated && star <= myRating;
          const isHovered = !hasRated && star <= hoveredStar;
          
          return (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => !hasRated && setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              disabled={isProcessing || hasRated}
              style={{
                fontSize: '24px',
                background: 'none',
                border: 'none',
                cursor: (isProcessing || hasRated) ? 'not-allowed' : 'pointer',
                opacity: (isProcessing || hasRated) ? 0.7 : 1,
                filter: (isSelected || isHovered) ? 'none' : 'grayscale(100%)',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
              title={hasRated ? `Your rating: ${myRating} star${myRating !== 1 ? 's' : ''}` : `Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              {isSelected ? '⭐' : '⭐'}
            </button>
          );
        })}
      </div>

      {isProcessing && (
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
          {isPending ? '⏳ Confirm in your wallet...' : '⏳ Confirming transaction...'}
        </div>
      )}
    </div>
  );
}
