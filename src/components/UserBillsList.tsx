'use client';

import { useState, useMemo } from 'react';
import { useUserBills, useBillMetadata } from '@/features/bill/hooks/useBillMetadata';
import Link from 'next/link';

interface UserBillsListProps {
  address: string;
}

function BillCard({ billId }: { billId: string }) {
  // billId from useUserBills is already a bytes32 hash
  const { metadata, tags, isPrivate, rating, isLoading } = useBillMetadata(billId, true);

  // Don't show anything while loading - just skip
  if (isLoading || !metadata) {
    return null;
  }

  // Use original bill.id from metadata for the link, fallback to hash for display
  const billLink = metadata?.id || billId;
  const displayId = billId.slice(0, 10) + '...' + billId.slice(-8);

  return (
    <div
      className="retro-list-item"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
      }}
    >
      {/* Title and link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <Link
            href={`/bill/${billLink}`}
            style={{
              color: '#0000ff',
              textDecoration: 'underline',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {metadata.title || 'Untitled Bill'}
          </Link>
          <div style={{ fontSize: '9px', color: '#666', marginTop: '2px', fontFamily: 'monospace' }}>
            {displayId}
          </div>
        </div>

        {/* Privacy badge */}
        {isPrivate && (
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              background: '#ffcccc',
              border: '1px solid #ff0000',
            }}
          >
            🔒 Private
          </span>
        )}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {tags.map(tag => (
            <span
              key={tag}
              style={{
                fontSize: '9px',
                padding: '2px 6px',
                background: '#e0e0e0',
                border: '1px solid #808080',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Rating */}
      {rating && rating.count > 0 && (
        <div style={{ fontSize: '10px', color: '#666' }}>
          ⭐ {rating.average.toFixed(1)} ({rating.count} rating{rating.count !== 1 ? 's' : ''})
        </div>
      )}

      {/* Total */}
      {metadata.items && metadata.items.length > 0 && (
        <div style={{ fontSize: '10px', color: '#666' }}>
          Total: $
          {(
            metadata.items.reduce((sum: number, item: { amount?: number }) => sum + (item.amount || 0), 0) +
            (metadata.tip || 0) +
            (metadata.tax || 0)
          ).toFixed(2)}
        </div>
      )}
    </div>
  );
}

// Helper component to load metadata and enable filtering/sorting
function BillsListWithMetadata({ billIds, filterTag, sortBy }: { billIds: string[]; filterTag: string; sortBy: 'date' | 'rating' }) {
  // Load metadata for all bills
  const billsWithMetadata = billIds.map(billId => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { metadata, tags, rating } = useBillMetadata(billId, true);
    return { billId, metadata, tags, rating };
  });

  // Filter and sort
  const processedBills = useMemo(() => {
    let filtered = billsWithMetadata;

    // Filter by tag
    if (filterTag) {
      filtered = filtered.filter(bill => 
        bill.tags && bill.tags.includes(filterTag)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'rating') {
        const ratingA = a.rating?.average || 0;
        const ratingB = b.rating?.average || 0;
        return ratingB - ratingA; // Highest first
      }
      // Default: date (newest first) - bills are already in order from contract
      return 0;
    });

    return sorted;
  }, [billsWithMetadata, filterTag, sortBy]);

  if (processedBills.length === 0) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          fontSize: '11px',
          color: '#666',
          background: '#ffffff',
          border: '2px inset #808080',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ marginBottom: '8px', fontSize: '24px' }}>📭</div>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          {filterTag ? `No bills with tag "${filterTag}"` : 'No bills published yet'}
        </div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>
          {filterTag ? 'Try a different tag' : 'Create a bill and publish it on-chain to see it here'}
        </div>
      </div>
    );
  }

  return (
    <div className="retro-list" style={{ maxHeight: '400px', minHeight: '120px', overflow: 'auto' }}>
      {processedBills.map(({ billId }) => (
        <BillCard key={billId} billId={billId} />
      ))}
    </div>
  );
}

export function UserBillsList({ address }: UserBillsListProps) {
  const { billIds, isLoading } = useUserBills(address);
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');

  // Get unique tags from all bills
  const availableTags = useMemo(() => {
    return ['restaurant', 'cafe', 'groceries', 'shopping', 'travel', 'dinner', 'friends', 'business'];
  }, []);

  if (isLoading) {
    return (
      <div className="retro-group">
        <div className="retro-group-title">📋 My Bills</div>
        <div style={{ padding: '12px', fontSize: '11px' }}>Loading your bills...</div>
      </div>
    );
  }

  return (
    <div className="retro-group">
      <div className="retro-group-title">📋 My Bills ({billIds.length})</div>
      <div style={{ padding: '12px' }}>
        {/* Filters */}
        <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Tag filter */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="retro-label" style={{ fontSize: '10px' }}>
              Filter by tag:
            </label>
            <select
              className="retro-input"
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            >
              <option value="">All tags</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label className="retro-label" style={{ fontSize: '10px' }}>
              Sort by:
            </label>
            <select
              className="retro-input"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'rating')}
              style={{ width: '100%', marginTop: '4px' }}
            >
              <option value="date">Date (newest first)</option>
              <option value="rating">Rating (highest first)</option>
            </select>
          </div>
        </div>

        {/* Bills list */}
        <BillsListWithMetadata billIds={billIds} filterTag={filterTag} sortBy={sortBy} />

        {/* Info */}
        <div
          style={{
            marginTop: '12px',
            fontSize: '10px',
            color: '#666',
            borderTop: '1px solid #808080',
            paddingTop: '8px',
          }}
        >
          💡 Only bills published on-chain are shown here
        </div>
      </div>
    </div>
  );
}
